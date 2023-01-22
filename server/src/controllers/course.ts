// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import Course from '../database/models/course';

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface CourseData {
  id: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV'
}

interface JsonError extends Error {
  expose?: boolean,
  status?: number,
  statusCode?: number,
  body?: string,
  type?: string
}

// Middleware function for handling errors in JSON parsing
export function handleInvalidRequestJson(err: JsonError, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof SyntaxError && err.status === 400 && err.body !== undefined) {
    res.status(400).send({
      success: false,
      errors: [ `SyntaxError: ${err.message}: ${err.body}` ]
    });
  } else
    next();
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().strict().required(),
    minCredits: yup.number().min(0).required(),
    maxCredits: yup.number().min(yup.ref('minCredits')).required()
  });

  try {
    await requestSchema.validate(req.body, { abortEarly: false });

    const course: Course = await Course.create({
      courseCode: req.body.courseCode,
      minCredits: req.body.minCredits,
      maxCredits: req.body.maxCredits
    });

    res.json({ 
      success: true,
      data: course
    });
  } catch (error) {
    // TODO: appropriate logging in case of errors
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
