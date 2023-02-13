// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import models from '../database/models';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';

import { CourseData } from '../types/course';
import { idSchema } from '../types/general';
import { Language, localizedStringSchema } from '../types/language';
import { CourseWithTranslation } from '../types/model';

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required()
  });

  const t: Transaction = await sequelize.transaction();

  try {
    await requestSchema.validate(req.body, { abortEarly: false });

    const course: Course = await Course.create({
      courseCode: req.body.courseCode
    }, { transaction: t });

    const courseTranslations: Array<CourseTranslation> = await CourseTranslation.bulkCreate([
      {
        courseId: course.id,
        language: Language.Finnish,
        department: req.body.department.fi ?? '',
        courseName: req.body.name.fi ?? ''
      },
      {
        courseId: course.id,
        language: Language.English,
        department: req.body.department.en ?? '',
        courseName: req.body.name.en ?? ''
      },
      {
        courseId: course.id,
        language: Language.Swedish,
        department: req.body.department.sv ?? '',
        courseName: req.body.name.sv ?? ''
      }
    ], { transaction: t });

    await t.commit();

    const courseData: CourseData = {
      id: course.id,
      courseCode: course.courseCode,
      department: {
        en: '',
        fi: '',
        sv: ''
      },
      name: {
        en: '',
        fi: '',
        sv: ''
      },
      evaluationInformation: {
        en: '',
        fi: '',
        sv: ''
      }
    };

    for (const translation of courseTranslations) {
      switch (translation.language) {

      case Language.English:
        courseData.department.en = translation.department;
        courseData.name.en = translation.courseName;
        break;

      case Language.Finnish:
        courseData.department.fi = translation.department;
        courseData.name.fi = translation.courseName;
        break;

      case Language.Swedish:
        courseData.department.sv = translation.department;
        courseData.name.sv = translation.courseName;
        break;

      }
    }

    res.json({
      success: true,
      course: courseData
    });
  } catch (error) {
    // TODO: appropriate logging in case of errors
    await t.rollback();

    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        success: false,
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        errors: [ 'Internal Server Error' ]
      });
    }
  }
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  try {
    const courseId: number = Number(req.params.courseId);
    await idSchema.validate({ id: courseId });

    const course: CourseWithTranslation | null = await models.Course.findByPk(courseId, {
      attributes: ['id', 'courseCode'],
      include: {
        model: CourseTranslation,
        attributes: ['language', 'courseName', 'department'],
      }
    }) as CourseWithTranslation;

    if (!course) {
      throw new Error(`course with an id ${courseId} not found`);
    }

    const courseData: CourseData = {
      id: course.id,
      courseCode: course.courseCode,
      department: {
        en: '',
        fi: '',
        sv: ''
      },
      name: {
        en: '',
        fi: '',
        sv: ''
      },
      evaluationInformation: {
        en: '',
        fi: '',
        sv: ''
      }
    };

    course.CourseTranslations.forEach((translation: CourseTranslation) => {
      switch (translation.language) {
      case Language.English:
        courseData.department.en = translation.department;
        courseData.name.en = translation.courseName;
        break;
      case Language.Finnish:
        courseData.department.fi = translation.department;
        courseData.name.fi = translation.courseName;
        break;
      case Language.Swedish:
        courseData.department.sv = translation.department;
        courseData.name.sv = translation.courseName;
        break;
      }
    });

    res.status(200).send({
      success: true,
      course: courseData
    });
    return;
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof yup.ValidationError) {
      res.status(400).send({
        success: false,
        error: error.errors
      });
      return;
    }

    if (error instanceof Error && error?.message.startsWith('course with an id')) {
      res.status(404).send({
        success: false,
        error: error.message
      });
      return;
    }
    res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}