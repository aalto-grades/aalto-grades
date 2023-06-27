// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import { Formula } from 'aalto-grades-common/types';
import {
  CalculationInput, CalculationResult
} from '../types/formulas';
import { Status } from '../types/grades';

interface WeightedAverageParams {
  min: number;
  max: number;
  weight: number;
}

async function calculateWeightedAverage(
  inputs: Array<CalculationInput>
): Promise<CalculationResult> {
  let grade: number = 0;
  let status: Status = Status.Pass;

  for (const input of inputs) {
    const subResult: CalculationResult = input.subResult;
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

const codeSnippet: string =
`const weightedAverage = (nums, weights) => {
  const [sum, weightSum] = weights.reduce(
    (acc, w, i) => {
      acc[0] = acc[0] + nums[i] * w;
      acc[1] = acc[1] + w;
      return acc;
    },
    [0, 0]
  );
  return sum / weightSum;
};`;

const name: string = 'Weighted average';

const attributes: Array<string> = ['maxPoints', 'minRequiredPoints', 'weight'];

registerFormula(
  Formula.WeightedAverage,
  calculateWeightedAverage,
  codeSnippet,
  name,
  attributes,
  yup.object({
    min: yup.number().required(),
    max: yup.number().min(yup.ref('min')).required(),
    weight: yup.number().required()
  }).noUnknown().strict()
);
