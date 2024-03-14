// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseInstanceData, HttpCode, Period} from '@common/types';
import {Request, Response} from 'express';
import * as yup from 'yup';

import AssessmentModel from '../database/models/assessmentModel';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import {ApiError, CourseFull, idSchema, JwtClaims} from '../types';
import {findAssessmentModelById} from './utils/assessmentModel';
import {findCourseById, parseCourseFull} from './utils/course';
import {toDateOnlyString} from './utils/date';
import {isTeacherInChargeOrAdmin} from './utils/user';

interface CourseInstanceWithCourseFull extends CourseInstance {
  Course: CourseFull;
}

export async function getCourseInstance(
  req: Request,
  res: Response
): Promise<void> {
  // Validate IDs.
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({id: courseId});

  const instanceId: number = Number(req.params.instanceId);
  await idSchema.validate({id: instanceId});

  const instance: CourseInstanceWithCourseFull | null =
    (await CourseInstance.findByPk(instanceId, {
      include: [
        {
          model: Course,
          include: [
            {
              model: CourseTranslation,
            },
            {
              model: User,
              as: 'Users',
            },
          ],
        },
      ],
    })) as CourseInstanceWithCourseFull;

  // Verify that a course instance was found.
  if (!instance) {
    throw new ApiError(
      `course instance with ID ${instanceId} not found`,
      HttpCode.NotFound
    );
  }

  // Verify that the course instance belongs to the found course.
  if (instance.courseId != courseId) {
    throw new ApiError(
      `course instance with ID ${instanceId} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  const parsedInstanceData: CourseInstanceData = {
    id: instance.id,
    assessmentModelId: instance.assessmentModelId,
    sisuCourseInstanceId: instance.sisuCourseInstanceId,
    startingPeriod: instance.startingPeriod as Period,
    endingPeriod: instance.endingPeriod as Period,
    startDate: toDateOnlyString(instance.startDate),
    endDate: toDateOnlyString(instance.endDate),
    type: instance.type,
    courseData: parseCourseFull(instance.Course),
  };

  res.status(HttpCode.Ok).send({
    data: parsedInstanceData,
  });
}

export interface CourseInstanceWithTeacherNames extends CourseInstance {
  Users: Array<{name: string}>;
}

export async function getAllCourseInstances(
  req: Request,
  res: Response
): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({id: courseId});

  // Ensure course exists
  await findCourseById(courseId, HttpCode.NotFound);

  const instances: Array<CourseInstanceWithCourseFull> =
    (await CourseInstance.findAll({
      where: {
        courseId,
      },
      include: [
        {
          model: Course,
          include: [
            {
              model: CourseTranslation,
            },
            {
              model: User,
              as: 'Users',
            },
          ],
        },
      ],
    })) as Array<CourseInstanceWithCourseFull>;

  const courseInstances: Array<CourseInstanceData> = [];

  instances.forEach((instance: CourseInstanceWithCourseFull) => {
    const instanceData: CourseInstanceData = {
      courseData: parseCourseFull(instance.Course),
      assessmentModelId: instance.assessmentModelId,
      sisuCourseInstanceId: instance.sisuCourseInstanceId,
      id: instance.id,
      startingPeriod: instance.startingPeriod as Period,
      endingPeriod: instance.endingPeriod as Period,
      startDate: toDateOnlyString(instance.startDate),
      endDate: toDateOnlyString(instance.endDate),
      type: instance.type,
    };

    courseInstances.push(instanceData);
  });

  res.status(HttpCode.Ok).send({
    data: courseInstances,
  });
}

export async function addCourseInstance(
  req: Request,
  res: Response
): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    assessmentModelId: yup.number().notRequired(),
    sisuCourseInstanceId: yup.string().notRequired(),
    startingPeriod: yup.string().oneOf(Object.values(Period)).required(),
    endingPeriod: yup.string().oneOf(Object.values(Period)).required(),
    type: yup.string().required(),
    startDate: yup.date().required(),
    endDate: yup.date().required(),
  });

  const courseId: number = Number(req.params.courseId);
  await requestSchema.validate(req.body, {abortEarly: false});

  // Confirm that course exists.
  await findCourseById(courseId, HttpCode.NotFound);

  // Route is only available for admins and those who have teacher in charge role for the course.
  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    courseId,
    HttpCode.Forbidden
  );

  if (req.body.assessmentModelId) {
    const assessmentModel: AssessmentModel = await findAssessmentModelById(
      req.body.assessmentModelId,
      HttpCode.UnprocessableEntity
    );

    if (assessmentModel.courseId !== courseId) {
      throw new ApiError(
        `assessment model with ID ${assessmentModel.id} ` +
          `does not belong to the course with ID ${courseId}`,
        HttpCode.Conflict
      );
    }
  }

  // Check that sisu ID not in use.
  if (req.body.sisuCourseInstanceId) {
    const instance: CourseInstance | null = await CourseInstance.findOne({
      where: {
        sisuCourseInstanceId: req.body.sisuCourseInstanceId,
      },
    });

    if (instance) {
      throw new ApiError(
        `sisu ID ${instance.sisuCourseInstanceId} already in use on instance ID ${instance.id}`,
        HttpCode.Conflict
      );
    }
  }

  const newInstance: CourseInstance = await CourseInstance.create({
    courseId: courseId,
    assessmentModelId: req.body.assessmentModelId,
    sisuCourseInstanceId: req.body.sisuCourseInstanceId,
    startingPeriod: req.body.startingPeriod,
    endingPeriod: req.body.endingPeriod,
    type: req.body.type,
    startDate: toDateOnlyString(req.body.startDate),
    endDate: toDateOnlyString(req.body.endDate),
  });

  res.status(HttpCode.Ok).send({
    data: newInstance.id,
  });
}
