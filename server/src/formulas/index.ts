// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { CalculationResult, Formula, registerFormula, Status } from '../types/formulas';

registerFormula(
  Formula.Manual,
  yup.object(),
  // If no points have been input for a student, assume the attainment
  // has been failed.
  async (
    _params: any,
    _subGrades: Array<CalculationResult>,
  ): Promise<CalculationResult> => {
    return { status: Status.Fail, points: undefined };
  },
);

