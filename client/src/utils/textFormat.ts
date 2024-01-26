// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradingScale} from '@common/types';

// use 'en-GB' to get "20.07.2012, 05:00:00"
// (instead of 'fi-GB' which produces "20.7.2012 klo 5.00.00")
export function formatDateToString(date: Date): string {
  const str: string = date.toLocaleString('en-GB').replaceAll('/', '.');
  return str.split(',')[0];
}

// Change date string of format "2012-07-20" to Date type
export function formatStringToDate(str: string): Date {
  const date: Date = new Date(str);
  return date;
}

// Format Date type values to strings of the format "2023-01-01"
export function formatDateToSlashString(date: Date): string {
  const str: string = date.toLocaleString('en-GB');
  return str.split('T')[0];
}

// Change date string from format "2012-07-20" to "20.07.2012"
export function formatDateString(dateStr: string): string {
  const attributes: Array<string> = dateStr.split('-');
  const year: string = attributes[0];
  const month: string = attributes[1];
  const day: string = attributes[2];
  return [day, month, year].join('.');
}

// Format Sisu course types to a more readable form.
export function formatSisuCourseType(courseType: string): string {
  switch (courseType) {
    case 'teaching-participation-lectures':
      return 'Teaching';
    case 'exam-exam':
      return 'Exam';
    case 'teaching-participation-project':
      return 'Project';
    default:
      return courseType;
  }
}

// Change course type from "NUMERICAL", "PASSFAIL" and from "SECOND_NATIONAL_LANGUAGE"
// to a more readable types.
// These are for the UI only. These need to be converted back when adding data to the server.
export function convertToClientGradingScale(
  gradingScale: GradingScale
): string {
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

export function convertToServerGradingScale(
  gradingScale: string
): GradingScale | string {
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
