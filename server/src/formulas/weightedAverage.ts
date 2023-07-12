// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

import { registerFormula } from '.';
import { Formula, Status } from 'aalto-grades-common/types';
import { ApiError } from '../types/error';
import { CalculationResult, ParamsObject } from '../types/formulas';
import { HttpCode } from '../types/httpCode';

interface ChildParams {
  weight: number;
}

interface Params extends ParamsObject<ChildParams> {}

const childParams: Array<string> = ['weight'];
const params: Array<string> = [];

function calculateWeightedAverage(
  attainmentTag: string,
  params: Params | null,
  subGrades: Array<CalculationResult>
): CalculationResult {

  let grade: number = 0;
  let status: Status = Status.Pass;

  if (params) {
    const weights: Map<string, ChildParams> = new Map(params.children);

    for (const subGrade of subGrades) {
      if (subGrade.status !== Status.Pass)
        status = Status.Fail;

      const weight: number | undefined = weights.get(subGrade.attainmentTag)?.weight;
      if (weight) {
        grade += subGrade.grade * weight;
      } else {
        throw new ApiError(
          `weight unspecified for attainment with tag ${subGrade.attainmentTag}`,
          HttpCode.InternalServerError
        );
      }
    }
  }

  return {
    attainmentTag: attainmentTag,
    grade: grade,
    status: status
  };
}

const codeSnippet: string =
`interface ChildParams {
  weight: number;
}

interface Params extends ParamsObject<ChildParams> {}

function calculateWeightedAverage(
  attainmentTag: string,
  params: Params | null,
  subGrades: Array<CalculationResult>
): CalculationResult {

  let grade: number = 0;
  let status: Status = Status.Pass;

  if (params) {
    const weights: Map<string, ChildParams> = new Map(params.children);

    for (const subGrade of subGrades) {
      if (subGrade.status !== Status.Pass)
        status = Status.Fail;

      const weight: number | undefined = weights.get(subGrade.attainmentTag)?.weight;
      if (weight) {
        grade += subGrade.grade * weight;
      } else {
        throw new ApiError(
          \`weight unspecified for attainment with tag \${subGrade.attainmentTag}\`,
          HttpCode.InternalServerError
        );
      }
    }
  }

  return {
    attainmentTag: attainmentTag,
    grade: grade,
    status: status
  };
}`;

registerFormula(
  Formula.WeightedAverage,
  calculateWeightedAverage,
  codeSnippet,
  'Weighted average',
  params,
  childParams,
  yup.object({
    children: yup.array().of(
      yup.tuple([
        yup.string(),
        yup.object({
          weight: yup.number().required()
        }).noUnknown().strict()
      ])
    ).required()
  }).noUnknown().strict()
);
