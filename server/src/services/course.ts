// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { IncludeOptions } from 'sequelize';
import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';

export interface CourseWithTranslationAndInstance extends Course {
  CourseTranslations: Array<CourseTranslation>
  CourseInstances: Array<CourseInstance>
}

/**
 * Finds a course by its id, and includes related data from the CourseTranslation and CourseInstance models,
 * depending on whether an instanceId is provided.
 * @param {number} courseId - The id of the course to be found.
 * @param {number | null} [instanceId=null] - The id of the course instance, defaults to null. If provided, it will include data from the CourseInstance model for the instance with that specific id.
 * @returns {Promise<Course>} - A promise that resolves with the found course object.
 * @throws {Error} - If the course or course instance is not found, it throws an error with a message indicating the missing course or course instance.
 */
export async function findCourseById(courseId: number, instanceId: number | null = null): Promise<CourseWithTranslationAndInstance> {
  const include: Array<IncludeOptions> = [{
    model: CourseTranslation,
    attributes: ['language', 'courseName', 'department'],
  }];

  if (instanceId) include.push({
    model: CourseInstance,
    attributes: ['gradingType', 'startingPeriod', 'endingPeriod', 'teachingMethod', 'startDate', 'endDate', 'responsibleTeacher'],
    where: {
      id: instanceId
    }
  });

  const course: Course | null = await models.Course.findByPk(courseId, {
    attributes: ['id', 'courseCode', 'minCredits', 'maxCredits'],
    include: include
  });

  if (!course && instanceId) throw new Error (`course instance with id ${instanceId} and course id ${courseId} not found`);

  if (!course) throw new Error (`course with an id ${courseId} not found`);

  return course as CourseWithTranslationAndInstance;
}
