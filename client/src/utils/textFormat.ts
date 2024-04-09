// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradingScale} from '@common/types';

// Change course type from "NUMERICAL", "PASSFAIL" and from "SECOND_NATIONAL_LANGUAGE"
// to a more readable types.
// These are for the UI only. These need to be converted back when adding data to the server.
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
