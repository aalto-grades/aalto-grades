// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LocalizedString } from './language';

export enum GradingScale {
  PassFail = 'PASS_FAIL',
  Numerical = 'NUMERICAL'
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
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface CourseInstanceData {
  courseData: CourseData,
  // Course instance ID can be null when representing Sisu course instance data
  id: number | null,
  sisuCourseInstanceId: string | null,
  startingPeriod: Period | null,
  endingPeriod: Period | null,
  minCredits: number,
  maxCredits: number,
  startDate: Date,
  endDate: Date,
  type: string,
  gradingScale: GradingScale,
  // TODO: There should maybe be a UserData interface if more data is needed,
  // for example ID of user.
  teachersInCharge?: Array<string>
}

export enum CourseInstanceRoleType {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  TeacherInCharge = 'TEACHER_IN_CHARGE',
}
