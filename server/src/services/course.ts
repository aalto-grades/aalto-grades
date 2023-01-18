// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';

export interface CourseWithTranslationAndInstance extends Course {
  CourseTranslations: Array<CourseTranslation>
  CourseInstances: Array<CourseInstance>
}

export async function findAllInstances(courseId: number): Promise<Array<CourseInstance>> {
  const instances: Array<CourseInstance> | null = await models.CourseInstance.findAll({
    attributes: ['courseId', 'gradingType', 'startingPeriod', 'endingPeriod'],
    where: {
      courseId: courseId
    }
  });

  if (!instances) throw new Error (`Instances with an id ${courseId} not found`);

  return instances;
}