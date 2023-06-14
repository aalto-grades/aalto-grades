// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { GradingScale } from 'aalto-grades-common/types/course';

// use 'en-GB' to get "20.07.2012, 05:00:00"
// (instead of 'fi-GB' which produces "20.7.2012 klo 5.00.00")
function formatDateToString(date: Date): string {
  const str: string = date.toLocaleString('en-GB').replaceAll('/', '.');
  return str.split(',')[0];
}

// Change date string of format "2012-07-20" to Date type
function formatStringToDate(str: string): Date {
  const date: Date = new Date(str);
  return date;
}

// Format Date type values to strings of the format "2023-01-01"
function formatDateToSlashString(date: Date): string {
  const str: string = date.toLocaleString('en-GB');
  return str.split('T')[0];
}

// Change date string from format "2012-07-20" to "20.07.2012"
function formatDateString(dateStr: string): string {
  const attributes: Array<string> = dateStr.split('-');
  const year: string = attributes[0];
  const month: string = attributes[1];
  const day: string = attributes[2];
  return [day, month, year].join('.');
}

// Change course type from "LECTURE" to "Lecture" and from "EXAM" to "Exam".
// Also, change course type gotten from Sisu to a more readable type
function formatCourseType(courseType: string): string {
  switch (courseType) {
  case 'teaching-participation-lectures':  // Type from Sisu API
    return 'Teaching';
  case 'exam-exam':  // Type from Sisu API
    return 'Exam';
  case 'teaching-participation-project':  // Type from Sisu API
    return 'Project';
  case 'LECTURE':
    return 'Teaching';
  case 'EXAM':
    return 'Exam';
  default:
    return courseType;
  }
}

// Change course type from "NUMERICAL", "PASSFAIL" and from "SECOND_NATIONAL_LANGUAGE"
// to a more readable types.
// These are for the UI only. These need to be converted back when adding data to the server.
function convertToClientGradingScale(gradingScale: GradingScale): string {
  switch (gradingScale) {
  case GradingScale.Numerical:
    return 'General scale, 0-5';
  case GradingScale.PassFail:
    return 'Pass-Fail';
  case GradingScale.SecondNationalLanguage:
    return 'Second national language';
  default:
    return gradingScale;
  }
}

function convertToServerGradingScale(gradingScale: string): GradingScale | string {
  switch (gradingScale) {
  case 'General scale, 0-5':
    return GradingScale.Numerical;
  case 'Pass-Fail':
    return GradingScale.PassFail;
  case 'Second national language':
    return GradingScale.SecondNationalLanguage;
  default:
    return gradingScale;
  }
}

export default {
  convertToServerGradingScale,
  formatDateToString,
  formatStringToDate,
  formatDateToSlashString,
  formatDateString,
  formatCourseType,
  convertToClientGradingScale
};
