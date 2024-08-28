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

/** Finds all course tasks of a specific course. */
export const findCourseTaskByCourseId = async (
  courseId: number
): Promise<CourseTaskData[]> => {
  const courseParts = await CoursePart.findAll({where: {courseId}});

  const courseTasks = (await CourseTask.findAll({
    where: {coursePartId: courseParts.map(part => part.id)},
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
 * Finds a course task by url param ID and also validates the URL param.
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
 * Validates that a course task ID belongs to a course.
 *
 * @throws ApiError(404|409) if course task not found or doesn't belong to the
 *   course.
 */
export const validateCourseTaskBelongsToCourse = async (
  courseId: number,
  courseTaskId: number
): Promise<void> => {
  const courseTask = await findCourseTaskById(courseTaskId);
  const coursePart = await findCoursePartById(courseTask.coursePartId);

  // Check that course task belongs to the course.
  if (coursePart.courseId !== courseId) {
    throw new ApiError(
      `Course task ID ${courseTask.id} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }
};

/**
 * Finds the course, course part, and the course task by URL param IDs and also
 * validates the URL params.
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
