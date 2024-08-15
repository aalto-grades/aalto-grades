// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseTaskData, HttpCode} from '@/common/types';
import {parseAplusGradeSource} from './aplus';
import {findAndValidateCourseId} from './course';
import {findCoursePartById} from './coursePart';
import AplusGradeSource from '../../database/models/aplusGradeSource';
import Course from '../../database/models/course';
import CoursePart from '../../database/models/coursePart';
import CourseTask from '../../database/models/courseTask';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Finds a course task by its ID.
 *
 * @throws ApiError(404) if not found
 */
export const findCourseTaskById = async (id: number): Promise<CourseTask> => {
  const courseTask = await CourseTask.findByPk(id);
  if (!courseTask) {
    throw new ApiError(
      `Course task with ID ${id} not found`,
      HttpCode.NotFound
    );
  }
  return courseTask;
};

/** Finds all course tasks of a specific course part. */
export const findCourseTaskByCoursePartId = async (
  coursePartId: number
): Promise<CourseTaskData[]> => {
  const courseTasks = (await CourseTask.findAll({
    where: {coursePartId: coursePartId},
    include: AplusGradeSource,
    order: [['id', 'ASC']],
  })) as (CourseTask & {
    AplusGradeSources: AplusGradeSource[];
  })[];

  return courseTasks.map(
    (courseTask): CourseTaskData => ({
      id: courseTask.id,
      coursePartId: courseTask.coursePartId,
      name: courseTask.name,
      daysValid: courseTask.daysValid,
      maxGrade: courseTask.maxGrade,
      archived: courseTask.archived,
      aplusGradeSources: courseTask.AplusGradeSources.map(gradeSource =>
        parseAplusGradeSource(gradeSource)
      ),
    })
  );
};

/**
 * Finds a course task by url param id and also validates the url param.
 *
 * @throws ApiError(400|404) if not found.
 */
const findAndValidateCourseTaskId = async (
  courseTaskId: string
): Promise<CourseTask> => {
  const result = stringToIdSchema.safeParse(courseTaskId);
  if (!result.success) {
    throw new ApiError(
      `Invalid course task id ${courseTaskId}`,
      HttpCode.BadRequest
    );
  }
  return await findCourseTaskById(result.data);
};

/**
 * Validates that a course task id belongs to a course part.
 *
 * @throws ApiError(404|409) if course part not found or doesn't belong to the
 *   course.
 */
export const validateCourseTaskBelongsToCoursePart = async (
  coursePartId: number,
  courseTaskId: number
): Promise<void> => {
  const courseTask = await findCourseTaskById(courseTaskId);

  // Check that course task belongs to the course.
  if (courseTask.coursePartId !== coursePartId) {
    throw new ApiError(
      `Course part ID ${courseTask.id} ` +
        `does not belong to the course with ID ${coursePartId}`,
      HttpCode.Conflict
    );
  }
};

/**
 * Finds the course, course part, and the course task by url param ids and also
 * validates the url params.
 *
 * @throws ApiError(400|404|409) if either not found or invalid or if the course
 *   task does not belong to the course.
 */
export const validateCourseTaskPath = async (
  courseId: string,
  courseTaskId: string
): Promise<[Course, CoursePart, CourseTask]> => {
  const course = await findAndValidateCourseId(courseId);
  const courseTask = await findAndValidateCourseTaskId(courseTaskId);
  const coursePart = await findCoursePartById(courseTask.coursePartId);

  // Check that the course part belongs to the course.
  if (coursePart.courseId !== course.id) {
    throw new ApiError(
      `Course task ID ${courseTask.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, coursePart, courseTask];
};
