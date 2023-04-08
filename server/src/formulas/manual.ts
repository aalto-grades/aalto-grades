// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import { CalculationResult, Formula, Status } from '../types/formulas';

// The 'Manual' formula requires a grade to be manually specified by a teacher.
// The formula function of the 'Manual' formula is only called when a grade has
// not been specified.
async function manualGradeUnspecified(): Promise<CalculationResult> {
  // If no grade has been input for a student, assume the attainment
  // has been failed.
  return {
    status: Status.Fail,
    grade: undefined,
  };
}

registerFormula(
  Formula.Manual,
  manualGradeUnspecified,
  yup.object()
);
