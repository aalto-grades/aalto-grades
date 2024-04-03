// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Language, LocalizedString} from './language';
import {UserData} from './user';

export enum GradingScale {
  PassFail = 'PASS_FAIL',
  Numerical = 'NUMERICAL',
  SecondNationalLanguage = 'SECOND_NATIONAL_LANGUAGE',
}

export enum Period {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
}

export interface CourseData {
  // Course ID is either number type ID in the Aalto Grades database or
  // undefined when representing parsed Sisu data.
  id?: number;
  courseCode: string;
  minCredits: number;
  maxCredits: number;
  department: LocalizedString;
  name: LocalizedString;
  gradingScale: GradingScale;
  languageOfInstruction: Language;
  teachersInCharge: Array<UserData>;
}

export interface CourseInstanceData {
  courseData?: CourseData;
  // Course instance and assessment model IDs can be null when representing
  // Sisu course instance data
  id?: number;
  assessmentModelId?: number;
  sisuInstanceInUse?: boolean;
  sisuCourseInstanceId?: string;
  startingPeriod?: Period;
  endingPeriod?: Period;
  startDate: Date;
  endDate: Date;
  type: string;
}

export enum CourseInstanceRoleType {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
}
