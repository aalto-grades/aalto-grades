// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import AssessmentModel from '../database/models/assessmentModel';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { CourseInstanceData, GradingScale, Period } from 'aalto-grades-common/types';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { idSchema } from '../types/general';
import { CourseFull } from '../types/model';
import { findAssessmentModelById } from './utils/assessmentModel';
import { findCourseById, parseCourseFull } from './utils/course';

interface CourseInstanceWithCourseFull extends CourseInstance {
    Course: CourseFull
  }

export async function getCourseInstance(req: Request, res: Response): Promise<void> {
  // Validate IDs.
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const instanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: instanceId });

  const instance: CourseInstanceWithCourseFull | null =
    await CourseInstance.findByPk(
      instanceId,
      {
        include: [
          {
            model: Course,
            include: [
              {
                model: CourseTranslation
              },
              {
                model: User
              }
            ]
          }
        ]
      }
    ) as CourseInstanceWithCourseFull;

  // Verify that a course instance was found.
  if (!instance) {
    throw new ApiError(
      `course instance with ID ${instanceId} not found`, HttpCode.NotFound
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
    startDate: instance.startDate,
    endDate: instance.endDate,
    type: instance.type,
    gradingScale: instance.gradingScale as GradingScale,
    courseData: parseCourseFull(instance.Course)
  };

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstance: parsedInstanceData
    }
  });
}

export interface CourseInstanceWithTeacherNames extends CourseInstance {
  Users: Array<{ name: string }>
}

export async function getAllCourseInstances(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  // Ensure course exists
  await findCourseById(courseId, HttpCode.NotFound);

  const instances: Array<CourseInstanceWithCourseFull> =
    await CourseInstance.findAll(
      {
        include: [
          {
            model: Course,
            include: [
              {
                model: CourseTranslation
              },
              {
                model: User
              }
            ]
          }
        ]
      }
    ) as Array<CourseInstanceWithCourseFull>;

  const instancesData: Array<CourseInstanceData> = [];

  instances.forEach((instance: CourseInstanceWithCourseFull) => {
    const instanceData: CourseInstanceData = {
      courseData: parseCourseFull(instance.Course),
      assessmentModelId: instance.assessmentModelId,
      sisuCourseInstanceId: instance.sisuCourseInstanceId,
      id: instance.id,
      startingPeriod: instance.startingPeriod as Period,
      endingPeriod: instance.endingPeriod as Period,
      startDate: instance.startDate,
      endDate: instance.endDate,
      type: instance.type,
      gradingScale: instance.gradingScale as GradingScale,
    };

    instancesData.push(instanceData);
  });

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstances: instancesData
    }
  });
}

export async function addCourseInstance(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    assessmentModelId: yup
      .number()
      .notRequired(),
    gradingScale: yup
      .string()
      .oneOf(Object.values(GradingScale))
      .required(),
    sisuCourseInstanceId: yup
      .string()
      .notRequired(),
    startingPeriod: yup
      .string()
      .oneOf(Object.values(Period))
      .required(),
    endingPeriod: yup
      .string()
      .oneOf(Object.values(Period))
      .required(),
    type: yup
      .string()
      .required(),
    startDate: yup
      .date()
      .required(),
    endDate: yup
      .date()
      .required()
  });

  /*
   * TODO: Check that the requester is authorized to add a course instance, 403
   * Forbidden if not
   */

  const courseId: number = Number(req.params.courseId);

  await requestSchema.validate(req.body, { abortEarly: false });

  // Confirm that course exists.
  await findCourseById(courseId, HttpCode.NotFound);

  if (req.body.assessmentModelId) {
    const assessmentModel: AssessmentModel = await findAssessmentModelById(
      req.body.assessmentModelId, HttpCode.UnprocessableEntity
    );

    if (assessmentModel.courseId !== courseId) {
      throw new ApiError(
        `assessment model with ID ${assessmentModel.id} ` +
        `does not belong to the course with ID ${courseId}`,
        HttpCode.Conflict
      );
    }
  }

  const newInstance: CourseInstance = await CourseInstance.create({
    courseId: courseId,
    assessmentModelId: req.body.assessmentModelId,
    sisuCourseInstanceId: req.body.sisuCourseInstanceId,
    gradingScale: req.body.gradingScale,
    startingPeriod: req.body.startingPeriod,
    endingPeriod: req.body.endingPeriod,
    type: req.body.type,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstance: {
        id: newInstance.id
      }
    }
  });
}
