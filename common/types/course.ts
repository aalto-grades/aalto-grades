// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LocalizedString } from './language';

export enum GradingScale {
  PassFail = 'PASS_FAIL',
  Numerical = 'NUMERICAL',
  SecondNationalLanguage = 'SECOND_NATIONAL_LANGUAGE'
}

export enum Period {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V'
}

export interface CourseData {
  // Course ID is either number type ID in the Aalto Grades database or
  // undefined when representing parsed Sisu data.
  id?: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface CourseInstanceData {
  courseData?: CourseData,
  // Course instance and assessment model IDs can be null when representing
  // Sisu course instance data
  id?: number,
  assessmentModelId?: number,
  sisuCourseInstanceId?: string,
  startingPeriod?: Period,
  endingPeriod?: Period,
  startDate: Date,
  endDate: Date,
  type: string,
  gradingScale: GradingScale,
  // TODO: There should maybe be a UserData interface if more data is needed,
  // for example ID of user.
  teachersInCharge?: Array<string> | Array<number>
}

export enum CourseInstanceRoleType {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  TeacherInCharge = 'TEACHER_IN_CHARGE',
}

export interface CoursesOfUser {
  current: Array<CourseData>,
  previous: Array<CourseData>
}
