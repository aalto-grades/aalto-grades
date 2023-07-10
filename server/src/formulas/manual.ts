// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import { AttainmentGradeData, Formula, Status } from 'aalto-grades-common/types';

/**
 * The 'Manual' formula requires a grade to be manually specified by a teacher.
 * The formula function of the 'Manual' formula is only called when a grade has
 * not been specified.
 */
function manualGradeUnspecified(attainmentId: number): AttainmentGradeData {
  // If no grade has been input for a student, assume the attainment
  // has been failed.
  // TODO: This assumption should not be made.
  return {
    attainmentId: attainmentId,
    status: Status.Fail,
    grade: 0,
    manual: false
  };
}

const codeSnippet: string = 'no preview for manual grading';

registerFormula(
  Formula.Manual,
  manualGradeUnspecified,
  codeSnippet,
  'Manual',
  [],
  yup.object().noUnknown().strict()
);
