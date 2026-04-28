// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {Request, Response} from 'express';

import {
  ExtServiceImportRequestSchema,
  ExtServiceImportStreamEventType,
  type ExternalSourceInfo,
  HttpCode,
  type NewExtServiceGradeSourceData,
  type NewTaskGrade,
} from '@/common/types';
import {sequelize} from '../database';
import {
  ApiError,
  type Endpoint,
  normalizeStringParam,
  stringToIdSchema,
} from '../types';
import {getExtServiceHandler} from './extservicehandlers';
import type {ExtServiceImportProgress} from './extservicehandlers/types';
import {validateCourseTaskPath} from './utils/courseTask';
import CourseTaskExternalSource from '../database/models/courseTaskExternalSource';
import ExternalSource from '../database/models/externalSource';

const parseServiceName = (serviceNameParam: string | string[]): string =>
  normalizeStringParam(serviceNameParam).toLowerCase();

const STREAM_KEEPALIVE_INTERVAL_MS = 10000;

const parseImportRequest = (body: unknown): number[] => {
  const result = ExtServiceImportRequestSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(result.error.message, HttpCode.BadRequest);
  }

  return result.data.courseTaskIds;
};

const createFetchGradesRequest = (
  req: Request,
  courseTaskIds: number[],
): Request => ({
  headers: req.headers,
  params: req.params,
  query: {
    'course-tasks': JSON.stringify(courseTaskIds),
  },
} as unknown as Request);

const writeStreamChunk = (res: Response, chunk: object): void => {
  res.write(`${JSON.stringify(chunk)}\n`);
};

const isStreamClosed = (res: Response): boolean => res.writableEnded || res.destroyed;

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

/**
 * ({ courseTaskIds: number[] }) => streamed import progress and result
 */
export const streamFetchServiceGrades: Endpoint<
  {courseTaskIds: number[]},
  void
> = async (req, res) => {
  const courseTaskIds = parseImportRequest(req.body);
  const serviceName = parseServiceName(req.params.serviceName);
  const handler = getExtServiceHandler(serviceName);

  res.status(HttpCode.Ok);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const heartbeatInterval = setInterval(() => {
    if (isStreamClosed(res)) {
      return;
    }

    writeStreamChunk(res, {
      type: ExtServiceImportStreamEventType.Heartbeat,
      timestamp: new Date(),
    });
  }, STREAM_KEEPALIVE_INTERVAL_MS);

  res.on('close', () => clearInterval(heartbeatInterval));

  try {
    writeStreamChunk(res, {
      type: ExtServiceImportStreamEventType.Progress,
      message: `Starting ${serviceName} import`,
      completedTasks: 0,
      totalTasks: courseTaskIds.length,
    });

    const grades = await handler.fetchGrades(
      createFetchGradesRequest(req, courseTaskIds),
      ({message, completedTasks, totalTasks}: ExtServiceImportProgress) => {
        if (isStreamClosed(res)) {
          return;
        }

        writeStreamChunk(res, {
          type: ExtServiceImportStreamEventType.Progress,
          message,
          completedTasks,
          totalTasks,
        });
      },
    );

    if (!isStreamClosed(res)) {
      writeStreamChunk(res, {
        type: ExtServiceImportStreamEventType.Result,
        message: `Imported ${grades.length} grades`,
        completedTasks: courseTaskIds.length,
        totalTasks: courseTaskIds.length,
        grades,
      });
    }
  } catch (error) {
    if (!isStreamClosed(res)) {
      writeStreamChunk(res, {
        type: ExtServiceImportStreamEventType.Error,
        message:
          error instanceof Error
            ? error.message
            : 'Import failed unexpectedly',
      });
    }
  } finally {
    clearInterval(heartbeatInterval);
    if (!isStreamClosed(res)) {
      res.end();
    }
  }
};
