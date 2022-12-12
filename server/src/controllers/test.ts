// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../database/index';
import models from '../database/models';

export async function testDbFindAllUsers(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      data: await models.User.findAll(),
    });
  } catch (err) {
    res.status(500);
    console.log('DB test error:', err);
    res.json({
      success: false,
      error: '',
    });
  }
}

export async function testDbFindAllCourses(req: Request, res: Response): Promise<void> {
  try {
    const language: string = req.params.langId.toUpperCase(); // uppercase to avoid invalid enum error
    res.json({
      success: true,
      data: await sequelize.query(
        `SELECT
          course.id,
          course.course_code AS "courseCode",
          course_translation.department,
          course_translation.course_name "courseName",
          course.min_credits AS "minCredits",
          course.max_credits AS "maxCredits"
        FROM course INNER JOIN
            course_translation ON course_translation.course_id = course.id
        WHERE language = :language`,
        {
          replacements: {
            language: language
          },
          model: models.Course,
          type: QueryTypes.SELECT,
          raw: true
        })
    });
  } catch (err) {
    res.status(500);
    console.log('DB test error:', err);
    res.json({
      success: false,
      error: '',
    });
  }
}
