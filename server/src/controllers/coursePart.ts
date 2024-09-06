// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';

import {
  type CoursePartData,
  type EditCoursePartData,
  HttpCode,
  type NewCoursePartData,
} from '@/common/types';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {
  findCoursePartByCourseId,
  validateCoursePartPath,
} from './utils/coursePart';
import CoursePart from '../database/models/coursePart';
import {ApiError, type Endpoint} from '../types';

/**
 * () => CoursePartData[]
 *
 * @throws ApiError(400|404)
 */
export const getCourseParts: Endpoint<void, CoursePartData[]> = async (
  req,
  res
) => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const coursePartData = await findCoursePartByCourseId(course.id);

  res.json(coursePartData);
};

/**
 * (NewCoursePartData) => number
 *
 * @throws ApiError(400|404|409)
 */
export const addCoursePart: Endpoint<NewCoursePartData, number> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);

  const [coursePart, created] = await CoursePart.findOrCreate({
    where: {
      name: req.body.name,
      courseId: courseId,
    },
    defaults: {
      name: req.body.name,
      expiryDate: req.body.expiryDate,
    },
  });

  if (!created) {
    throw new ApiError(
      'There cannot be two course parts with the same name',
      HttpCode.Conflict
    );
  }

  res.status(HttpCode.Created).json(coursePart.id);
};

/**
 * (EditCoursePartData) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editCoursePart: Endpoint<EditCoursePartData, void> = async (
  req,
  res
) => {
  const [, coursePart] = await validateCoursePartPath(
    req.params.courseId,
    req.params.coursePartId
  );

  try {
    await coursePart
      .set({
        name: req.body.name ?? coursePart.name,
        expiryDate:
          req.body.expiryDate !== undefined
            ? req.body.expiryDate
            : coursePart.expiryDate,
        archived: req.body.archived ?? coursePart.archived,
      })
      .save();
  } catch (error) {
    // Duplicate name error
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two course parts with the same name',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  }

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteCoursePart: Endpoint<void, void> = async (req, res) => {
  const [, coursePart] = await validateCoursePartPath(
    req.params.courseId,
    req.params.coursePartId
  );

  try {
    await coursePart.destroy();
  } catch (error) {
    // Catch deletion of course part with grades
    if (
      error instanceof ForeignKeyConstraintError &&
      error.index === 'task_grade_course_task_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete a course part with grades',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  }

  res.sendStatus(HttpCode.Ok);
};
