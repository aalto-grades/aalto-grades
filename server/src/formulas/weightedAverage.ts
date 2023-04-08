// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import { Formula, GradingInput, GradingResult, Status } from '../types/formulas';

interface WeightedAverageParams {
  min: number;
  max: number;
  weight: number;
}

async function calculateWeightedAverage(
  inputs: Array<GradingInput>
): Promise<GradingResult> {
  let grade: number = 0;
  let status: Status = Status.Pass;

  for (const input of inputs) {
    const subResult: GradingResult = input.subResult;
    const params: WeightedAverageParams = input.params as WeightedAverageParams;

    if (subResult.status !== Status.Pass)
      status = Status.Fail;

    grade += subResult.grade * params.weight;
  }

  return {
    grade: grade,
    status: status,
  };
}

registerFormula(
  Formula.WeightedAverage,
  calculateWeightedAverage,
  yup.object({
    min: yup.number().required(),
    max: yup.number().required(),
    weights: yup.array(yup.number().required()).required(),
  })
);
