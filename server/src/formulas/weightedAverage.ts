// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import { AttainmentGradeData, Formula, Status } from 'aalto-grades-common/types';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

interface WeightedAverageParams {
  weights: Array<[number, number]>;
}

function calculateWeightedAverage(
  attainmentId: number, params: object | null, subGrades: Array<AttainmentGradeData>
): AttainmentGradeData {

  let grade: number = 0;
  let status: Status = Status.Pass;

  const formulaParams: WeightedAverageParams = params as WeightedAverageParams;
  const weights: Map<number, number> = new Map(formulaParams.weights);

  for (const subGrade of subGrades) {
    if (subGrade.status !== Status.Pass)
      status = Status.Fail;

    const weight: number | undefined = weights.get(subGrade.attainmentId);
    if (weight) {
      grade += subGrade.grade * weight;
    } else {
      throw new ApiError(
        `weight unspecified for attainment with ID ${subGrade.attainmentId}`,
        HttpCode.InternalServerError
      );
    }
  }

  return {
    attainmentId: attainmentId,
    grade: grade,
    status: status,
    manual: false
  };
}

const codeSnippet: string =
`interface WeightedAverageParams {
  weights: Array<[number, number]>;
}

function calculateWeightedAverage(
  attainment: AttainmentData, subGrades: Array<AttainmentGradeData>
): AttainmentGradeData {

  let grade: number = 0;
  let status: Status = Status.Pass;

  const params: WeightedAverageParams = attainment.formulaParams as WeightedAverageParams;
  const weights: Map<number, number> = new Map(params.weights);

  for (const subGrade of subGrades) {
    if (subGrade.status !== Status.Pass)
      status = Status.Fail;

    const weight: number | undefined = weights.get(subGrade.attainmentId);
    if (weight) {
      grade += subGrade.grade * weight;
    } else {
      throw new ApiError(
        \`weight unspecified for attainment with ID \${subGrade.attainmentId}\`,
        HttpCode.InternalServerError
      );
    }
  }

  return {
    attainmentId: attainment.id ?? -1,
    grade: grade,
    status: status,
    manual: false
  };
}`;

registerFormula(
  Formula.WeightedAverage,
  calculateWeightedAverage,
  codeSnippet,
  'Weighted average',
  ['weight'],
  yup.object({
    weights: yup.array().of(
      yup.tuple([
        yup.number(),
        yup.number()
      ])
    ).required()
  }).noUnknown().strict()
);
