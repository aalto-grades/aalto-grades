// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';

import {
  type CourseTaskData,
  type EditCourseTaskData,
  HttpCode,
  type NewCourseTaskData,
} from '@/common/types';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {validateCoursePartBelongsToCourse} from './utils/coursePart';
import {
  findCourseTaskByCourseId,
  validateCourseTaskPath,
} from './utils/courseTask';
import CourseTask from '../database/models/courseTask';
import {ApiError, type Endpoint} from '../types';

/**
 * () => CourseTaskData[]
 *
 * @throws ApiError(400|404)
 */
export const getCourseTasks: Endpoint<void, CourseTaskData[]> = async (
  req,
  res
) => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const courseTaskData = await findCourseTaskByCourseId(course.id);

  res.json(courseTaskData);
};

/**
 * (NewCourseTaskData) => number
 *
 * @throws ApiError(400|404|409)
 */
export const addCourseTask: Endpoint<NewCourseTaskData, number> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);
  await validateCoursePartBelongsToCourse(courseId, req.body.coursePartId);

  const [courseTask, created] = await CourseTask.findOrCreate({
    where: {
      name: req.body.name,
      coursePartId: req.body.coursePartId,
    },
    defaults: {
      name: req.body.name,
      coursePartId: req.body.coursePartId,
      daysValid: req.body.daysValid,
      maxGrade: req.body.maxGrade,
    },
  });

  if (!created) {
    throw new ApiError(
      'There cannot be two course tasks with the same name',
      HttpCode.Conflict
    );
  }

  res.status(HttpCode.Created).json(courseTask.id);
};

/**
 * (EditCourseTaskData) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editCourseTask: Endpoint<EditCourseTaskData, void> = async (
  req,
  res
) => {
  const [, , courseTask] = await validateCourseTaskPath(
    req.params.courseId,
    req.params.courseTaskId
  );

  try {
    await courseTask
      .set({
        name: req.body.name ?? courseTask.name,
        daysValid:
          req.body.daysValid !== undefined
            ? req.body.daysValid
            : courseTask.daysValid,
        maxGrade:
          req.body.maxGrade !== undefined
            ? req.body.maxGrade
            : courseTask.maxGrade,
        archived: req.body.archived ?? courseTask.archived,
      })
      .save();
  } catch (error) {
    // Duplicate name error
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two course tasks with the same name',
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
export const deleteCourseTask: Endpoint<void, void> = async (req, res) => {
  const [, , courseTask] = await validateCourseTaskPath(
    req.params.courseId,
    req.params.courseTaskId
  );

  try {
    await courseTask.destroy();
  } catch (error) {
    // Catch deletion of course task with grades
    if (
      error instanceof ForeignKeyConstraintError &&
      error.index === 'task_grade_course_task_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete a course task with grades',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  }

  res.sendStatus(HttpCode.Ok);
};
