// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
    
export async function getAllCourseInstances(req: Request, res: Response): Promise<void> {
  try {
    let courses: Array<Course> = await models.Course.findAll({        
        attributes: ['id', 'courseCode', 'minCredits', 'maxCredits'],
        include: [{
          model: CourseInstance,
          where: {
            courseCode: Number(req.params.courseId)
          },
        },
        {
          model: CourseTranslation,
          attributes: ['language', 'courseName', 'department'],
        }],
      });

    // @ts-ignore
    const instances: Array<CourseInstance> = courses[0].CourseInstances;

    res.send({
      success: true,
      instances: instances,
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
  }
}