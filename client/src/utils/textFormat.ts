// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradingScale} from '@/common/types';

/**
 * Change course type from "NUMERICAL", "PASSFAIL" and from
 * "SECOND_NATIONAL_LANGUAGE" to a more readable types. These are for the UI
 * only. These need to be converted back when adding data to the server.
 */
export const convertToClientGradingScale = (
  gradingScale: GradingScale
): string => {
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
};

/**
 * Convert grading scale + grade into a string describing the grade, e.g. 0-5,
 * pass/fail, good/sat/fail
 */
export const getGradeString = (
  gradingScale: GradingScale,
  grade: number | undefined
): string => {
  if (grade === undefined) return '-';
  switch (gradingScale) {
    case GradingScale.Numerical:
      return grade.toString();
    case GradingScale.PassFail:
      return grade === 0 ? 'Fail' : 'Pass';
    case GradingScale.SecondNationalLanguage:
      if (grade === 0) return 'Fail';
      return grade === 1 ? 'Sat' : 'Good';
  }
};
