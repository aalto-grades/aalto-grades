// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import {
  CalculationResult,
  Formula,
  Status,
  WeightedAssignmentParams
} from '../types/formulas';

async function calculateWeightedAverage(
  params: WeightedAssignmentParams,
  subResults: Array<CalculationResult>
): Promise<CalculationResult> {
  let total: number = 0;

  for (let i: number = 0; i < subResults.length; ++i) {
    if (subResults[i].status != Status.Pass) {
      return {
        grade: undefined,
        status: subResults[i].status,
      };
    }
    total += subResults[i].grade! * params.weights[i];
  }

  return {
    grade: total,
    status: Status.Pass,
  };
}

registerFormula(
  Formula.WeightedAverage,
  yup.object({
    min: yup.number().required(),
    max: yup.number().required(),
    weights: yup.array(yup.number().required()).required(),
  }),
  calculateWeightedAverage,
);
