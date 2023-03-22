// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parse, Parser } from 'csv-parse';
import { NextFunction, Request, Response } from 'express';
import { Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';

import { CourseData } from '../types/course';
import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { Language, localizedStringSchema } from '../types/language';
import { CourseWithTranslation } from '../types/model';
import { findCourseWithTranslationById } from './utils/course';

export async function getCourse(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const course: CourseWithTranslation = await findCourseWithTranslationById(
    courseId, HttpCode.NotFound
  );

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

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      course: courseData
    }
  });
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required()
  });

  /*
   * TODO: Check that the requester is logged in, 401 Unauthorized if not
   * TODO: Check that the requester is authorized to add a course instance, 403
   * Forbidden if not
   */

  await requestSchema.validate(req.body, { abortEarly: false });

  const course: Course = await sequelize.transaction(
    async (t: Transaction): Promise<Course> => {

      const course: Course = await Course.create({
        courseCode: req.body.courseCode
      }, { transaction: t });

      await CourseTranslation.bulkCreate([
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

      return course;
    });

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      course: {
        id: course.id
      }
    }
  });
}

/**
 * Asynchronously adds grades from a CSV file to the database.
 * @param {Request} req - The HTTP request containing the CSV file.
 * @param {Response} res - The HTTP response to be sent to the client.
 * @param {NextFunction} next - The next middleware function to be executed in the pipeline.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If the CSV file loading fails.
*/
export async function addGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  /*
   * TODO: Check that the requester is logged in, 401 Unauthorized if not
   * TODO: Check that the requester is authorized to add grades, 403 Forbidden if not
   * TODO: Validate csv fields, csv has to match predetermined format, 400 Bad request?
   */

  if (!req?.file) {
    throw new ApiError('csv file loading failed, please try again', HttpCode.BadRequest);
  }

  const data: string = req.file.buffer.toString();
  const csvData: Array<Array<string>> = [];

  const parser: Parser = parse({
    delimiter: ','
  });

  parser
    .on('readable', function (): void {
      let row: Array<string>;
      while ((row = parser.read()) !== null) {
        csvData.push(row);
      }
    })
    .on('error', function (err: unknown): void {
      next(err);
    })
    .on('end', function (): void {
      console.log('CSV:', csvData);

      res.status(HttpCode.Ok).json({
        success: true
      });
      return;
    });

  // Write data to the stream
  parser.write(data);

  // Close the readable stream
  parser.end();
}
