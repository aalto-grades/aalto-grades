// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LocalizedString } from './language';

export enum GradingType {
  PassFail = 'PASSFAIL',
  Numerical = 'NUMERICAL'
}

export enum Period {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V'
}

export enum TeachingMethod {
  Lecture = 'LECTURE',
  Exam = 'EXAM'
}

export interface CourseData {
  // Course ID is either number type ID in the Aalto Grades database or
  // undefined when representing parsed Sisu data.
  id?: number | undefined,
  courseCode: string,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface CourseInstanceData {
  courseData: CourseData,
  // Course instance ID is either Sisu instance ID (string) or number type ID in
  // the Aalto Grades database.
  id: number | string,
  startingPeriod: string,
  endingPeriod: string,
  minCredits: number,
  maxCredits: number,
  startDate: Date,
  endDate: Date,
  courseType: string,
  gradingType: string,
  responsibleTeacher?: string | undefined,
  responsibleTeachers?: Array<string>,
}
