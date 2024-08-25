// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';

import {CourseTaskData, HttpCode, ModifyCourseTasks} from '@/common/types';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {validateCoursePartBelongsToCourse} from './utils/coursePart';
import {
  findCourseTaskByCourseId,
  validateCourseTaskPath,
} from './utils/courseTask';
import {sequelize} from '../database';
import CourseTask from '../database/models/courseTask';
import {ApiError, Endpoint} from '../types';

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
 * (ModifyCourseTasks) => void
 *
 * @throws ApiError()
 */
export const modifyCourseTasks: Endpoint<ModifyCourseTasks, unknown> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);

  const addTasks = req.body.add ?? [];
  const editTasks = req.body.edit ?? [];
  const deleteIds = req.body.delete ?? [];

  const editIds = editTasks.map(editTask => editTask.id);

  if (editIds.length !== [...new Set(editIds)].length) {
    throw new ApiError(
      'Tried to edit the same course task multiple times',
      HttpCode.Conflict
    );
  }

  if (deleteIds.length !== [...new Set(deleteIds)].length) {
    throw new ApiError(
      'Tried to delete the same course task multiple times',
      HttpCode.Conflict
    );
  }

  if (!editIds.every(editId => !new Set(deleteIds).has(editId))) {
    throw new ApiError(
      'Tried to edit and delete the same course task',
      HttpCode.Conflict
    );
  }

  const checkForDuplicateError = (error: unknown): void => {
    // Duplicate name error
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two course tasks with the same name',
        HttpCode.Conflict
      );
    }

    // Other error
    throw error;
  };

  let newIds: number[] = [];
  await sequelize.transaction(async t => {
    // Add tasks
    for (const {coursePartId} of addTasks) {
      await validateCoursePartBelongsToCourse(courseId, coursePartId);
    }

    try {
      newIds = (await CourseTask.bulkCreate(addTasks, {transaction: t})).map(
        courseTask => courseTask.id
      );
    } catch (error) {
      checkForDuplicateError(error);
    }

    // Edit tasks
    for (const editTask of editTasks) {
      const [, , courseTask] = await validateCourseTaskPath(
        courseId.toString(),
        editTask.id.toString()
      );

      try {
        await courseTask
          .set({
            name: editTask.name ?? courseTask.name,
            daysValid:
              editTask.daysValid !== undefined
                ? editTask.daysValid
                : courseTask.daysValid,
            maxGrade:
              editTask.maxGrade !== undefined
                ? editTask.maxGrade
                : courseTask.maxGrade,
            archived: editTask.archived ?? courseTask.archived,
          })
          .save({transaction: t});
      } catch (error) {
        checkForDuplicateError(error);
      }
    }

    // Delete tasks
    for (const deleteId of deleteIds) {
      const [, , courseTask] = await validateCourseTaskPath(
        courseId.toString(),
        deleteId.toString()
      );

      try {
        await courseTask.destroy({transaction: t});
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
    }
  });

  res.json(newIds);
};
