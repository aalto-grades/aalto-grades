// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { IncludeOptions } from 'sequelize';
import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';

export async function findCourseById(courseId: number, instanceId: number | null): Promise<Course> {
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

  return course;
}
