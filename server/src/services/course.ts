// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

export interface CourseWithTranslation extends Course {
  CourseTranslations: Array<CourseTranslation>
}

/**
 * Finds a course by its id, and include data from the CourseTranslation model.
 * @param {number} courseId - The id of the course to be found.
 * @returns {Promise<CourseWithTranslation>} - A promise that resolves with the found course object.
 * @throws {Error} - If the course is not found, throws an error with a message indicating the missing course.
 */
export async function findCourseById(courseId: number): Promise<CourseWithTranslation> {

  const course: Course | null = await models.Course.findByPk(courseId, {
    attributes: ['id', 'courseCode'],
    include: {
      model: CourseTranslation,
      attributes: ['language', 'courseName', 'department'],
    }
  });

  if (!course) throw new Error (`course with an id ${courseId} not found`);

  return course as CourseWithTranslation;
}

export interface InstanceWithTeacher {
  CourseInstance: CourseInstance
  Teacher: User | null
}

export async function findAllInstances(courseId: number): Promise<Array<Course | Array<InstanceWithTeacher>>> {
  
  const course: Course | null = await Course.findByPk(courseId);
  
  if (!course) throw new Error (`course with id ${courseId} not found`);  

  const instances: Array<CourseInstance> = await CourseInstance.findAll({
    attributes: ['id', 'courseId', 'gradingType', 'startingPeriod', 'endingPeriod', 'teachingMethod', 'responsibleTeacher', 'minCredits', 'maxCredits', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
    where: {
      courseId: courseId
    }
  });

  const instancesWithTeacher: Array<InstanceWithTeacher> = [];

  if (instances.length != 0) {
    for (const instance of instances) {
      const teacher: User | null = await User.findByPk(instance.responsibleTeacher);
      instancesWithTeacher.push({
        CourseInstance: instance,
        Teacher: teacher
      });
    }
  }

  return [course, instancesWithTeacher];
}
