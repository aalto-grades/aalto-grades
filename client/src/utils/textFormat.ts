// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {TFunction} from 'i18next';

import {GradingScale} from '@/common/types';

/**
 * Change course type from "NUMERICAL", "PASSFAIL" and from
 * "SECOND_NATIONAL_LANGUAGE" to a more readable types. These are for the UI
 * only. These need to be converted back when adding data to the server.
 */
export const convertToClientGradingScale = (
  t: TFunction,
  gradingScale: GradingScale
): string => {
  switch (gradingScale) {
    case GradingScale.Numerical:
      return t('utils.scale-numerical');
    case GradingScale.PassFail:
      return t('utils.scale-pass-fail');
    case GradingScale.SecondNationalLanguage:
      return t('utils.scale-second-lang');
    default:
      return gradingScale;
  }
};

/**
 * Convert grading scale + grade into a string describing the grade, e.g. 0-5,
 * pass/fail, good/sat/fail
 */
export const getGradeString = (
  t: TFunction,
  gradingScale: GradingScale,
  grade: number | undefined
): string => {
  if (grade === undefined) return '-';
  switch (gradingScale) {
    case GradingScale.Numerical:
      return grade.toString();
    case GradingScale.PassFail:
      return grade === 0 ? t('utils.fail') : t('utils.pass');
    case GradingScale.SecondNationalLanguage:
      if (grade === 0) return t('utils.fail');
      return grade === 1 ? t('utils.sat') : t('utils.good');
  }
};
