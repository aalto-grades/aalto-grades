// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import { CourseWithTranslation } from './course';

export interface InstanceWithCourseAndTranslation extends CourseInstance {
  Course: CourseWithTranslation
}

/**
 * Find a course instance by its id. Include data from the Course and CourseTranslation model.
 * @param {number} instanceId - The id of the course instance to be found.
 * @returns {Promise<InstanceWithCourseAndTranslation>} - A promise that resolves with the found course instance object.
 * @throws {Error} - If the course instance is not found, it throws an error with a message indicating the missing course instance.
 */
export async function findInstanceById(instanceId: number): Promise<InstanceWithCourseAndTranslation> {

  const instance: CourseInstance | null = await models.CourseInstance.findByPk(instanceId, {
    attributes: ['id', 'gradingType', 'startingPeriod', 'endingPeriod', 'teachingMethod', 'minCredits', 'maxCredits', 'startDate', 'endDate', 'responsibleTeacher'],
    include: {
      model: Course,
      attributes: ['id', 'courseCode' ],
      include: [
        {
          model: CourseTranslation,
          attributes: ['language', 'courseName', 'department']
        }
      ]
    }
  });

  if (!instance) throw new Error (`course instance with an id ${instanceId} not found`);

  return instance as InstanceWithCourseAndTranslation;
}
