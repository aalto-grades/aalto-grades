// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type ExternalSourceInfo,
  HttpCode,
  type NewExtServiceGradeSourceData,
  type NewTaskGrade,
} from '@/common/types';
import {sequelize} from '../database';
import {getExtServiceHandler} from './extservicehandlers';
import {validateCourseTaskPath} from './utils/courseTask';
import CourseTaskExternalSource from '../database/models/courseTaskExternalSource';
import ExternalSource from '../database/models/externalSource';
import {
  ApiError,
  type Endpoint,
  normalizeStringParam,
  stringToIdSchema,
} from '../types';

const parseServiceName = (serviceNameParam: string | string[]): string =>
  normalizeStringParam(serviceNameParam).toLowerCase();

/**
 * () => ServiceCourseData[]
 */
export const fetchServiceCourses: Endpoint<void, unknown> = async (req, res) => {
  const serviceName = parseServiceName(req.params.serviceName);
  const handler = getExtServiceHandler(serviceName);
  const courses = await handler.fetchCourses(req);
  res.json(courses);
};

/**
 * () => ServiceExerciseData
 */
export const fetchServiceExerciseData: Endpoint<void, unknown> = async (
  req,
  res,
) => {
  const serviceName = parseServiceName(req.params.serviceName);
  const handler = getExtServiceHandler(serviceName);
  const exerciseData = await handler.fetchExerciseData(req);
  res.json(exerciseData);
};

/**
 * (NewExtServiceGradeSourceData[]) => void
 */
export const addServiceGradeSources: Endpoint<
  NewExtServiceGradeSourceData[],
  void
> = async (req, res) => {
  const serviceName = parseServiceName(req.params.serviceName);
  const handler = getExtServiceHandler(serviceName);
  const parsedCourseId = normalizeStringParam(req.params.courseId);

  const requestDuplicates = new Set<string>();
  for (const source of req.body) {
    await validateCourseTaskPath(parsedCourseId, String(source.courseTaskId));

    const duplicateKey = JSON.stringify({
      courseTaskId: source.courseTaskId,
      extServiceCourseId: source.extServiceCourse.id,
      sourceType: source.sourceType,
      sourceId: source.id,
      itemname: source.itemname,
      serviceName,
    });
    if (requestDuplicates.has(duplicateKey)) {
      throw new ApiError(
        `attempted to add duplicate external source ${duplicateKey}`,
        HttpCode.Conflict,
      );
    }
    requestDuplicates.add(duplicateKey);
  }

  await sequelize.transaction(async (transaction) => {
    for (const source of req.body) {
      const existingLinks = await CourseTaskExternalSource.findAll({
        where: {courseTaskId: source.courseTaskId},
        transaction,
      });

      for (const existingLink of existingLinks) {
        const existingSource = await ExternalSource.findByPk(
          existingLink.externalSourceId,
          {transaction},
        );

        if (existingSource === null) {
          continue;
        }

        const existingSourceInfo = existingSource.sourceInfo as ExternalSourceInfo;

        if (
          existingSource.externalServiceName === handler.externalServiceName
          && existingSource.externalCourse.id === source.extServiceCourse.id
          && existingSourceInfo.sourceType === source.sourceType
          && existingSourceInfo.sourceId === source.id
        ) {
          throw new ApiError(
            `course task with ID ${source.courseTaskId} already has this external source`,
            HttpCode.Conflict,
          );
        }
      }

      const sourceRecord = source as NewExtServiceGradeSourceData
        & Record<string, unknown>;
      const {
        courseTaskId,
        extServiceCourse,
        id: sourceId,
        ...otherSourceInfo
      } = sourceRecord;

      const createdSource = await ExternalSource.create(
        {
          externalCourse: extServiceCourse,
          externalServiceName: handler.externalServiceName,
          sourceInfo: {
            sourceId,
            ...otherSourceInfo,
          },
        },
        {transaction},
      );

      await CourseTaskExternalSource.create(
        {
          courseTaskId,
          externalSourceId: createdSource.id,
        },
        {transaction},
      );
    }
  });

  res.sendStatus(HttpCode.Created);
};

/**
 * () => void
 */
export const deleteServiceGradeSource: Endpoint<void, void> = async (req, res) => {
  const parsedCourseId = normalizeStringParam(req.params.courseId);
  const parsedSourceId = normalizeStringParam(req.params.externalSourceId);
  const sourceIdResult = stringToIdSchema.safeParse(parsedSourceId);
  if (!sourceIdResult.success) {
    throw new ApiError(
      `Invalid external source ID ${parsedSourceId}`,
      HttpCode.BadRequest,
    );
  }
  const sourceId = sourceIdResult.data;

  const source = await ExternalSource.findByPk(sourceId);
  if (source === null) {
    throw new ApiError(
      `External source with ID ${sourceId} not found`,
      HttpCode.NotFound,
    );
  }

  const links = await CourseTaskExternalSource.findAll({
    where: {externalSourceId: sourceId},
  });

  const courseScopedLinkIds: number[] = [];
  for (const link of links) {
    try {
      await validateCourseTaskPath(parsedCourseId, String(link.courseTaskId));
      courseScopedLinkIds.push(link.id);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }
    }
  }

  if (courseScopedLinkIds.length === 0) {
    throw new ApiError(
      `External source with ID ${sourceId} does not belong to course ${parsedCourseId}`,
      HttpCode.Conflict,
    );
  }

  await sequelize.transaction(async (transaction) => {
    await CourseTaskExternalSource.destroy({
      where: {id: courseScopedLinkIds},
      transaction,
    });

    const remainingLinkCount = await CourseTaskExternalSource.count({
      where: {externalSourceId: sourceId},
      transaction,
    });

    if (remainingLinkCount === 0) {
      await source.destroy({transaction});
    }
  });

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => NewTaskGrade[]
 */
export const fetchServiceGrades: Endpoint<void, NewTaskGrade[]> = async (
  req,
  res,
) => {
  const serviceName = parseServiceName(req.params.serviceName);
  const handler = getExtServiceHandler(serviceName);
  const grades = await handler.fetchGrades(req);
  res.json(grades);
};
