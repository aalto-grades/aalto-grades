// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

export interface CourseWithTranslationAndInstance extends Course {
  CourseTranslations: Array<CourseTranslation>
  CourseInstances: Array<CourseInstance>
}

export interface InstanceWithTeacher {
  CourseInstance: CourseInstance
  Teacher: User | null
}

export async function findAllInstances(courseId: number): Promise<Array<Course | Array<InstanceWithTeacher>>> {
  
  const course: Course | null = await Course.findByPk(courseId);
  
  if (!course) throw new Error (`course with id ${courseId} not found`);  

  const instances: Array<CourseInstance> = await CourseInstance.findAll({
    attributes: ['id', 'courseId', 'gradingType', 'startingPeriod', 'endingPeriod', 'teachingMethod', 'responsibleTeacher', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
    where: {
      courseId: courseId
    }
  });

  var instancesWithTeacher: Array<InstanceWithTeacher> = [];

  if (instances.length != 0) {
    for (const instance of instances) {
      const teacher: User | null = await User.findByPk(instance.responsibleTeacher);
      instancesWithTeacher.push({
        CourseInstance: instance,
        Teacher: teacher
      });
    };
  };

  return [course, instancesWithTeacher];
}
