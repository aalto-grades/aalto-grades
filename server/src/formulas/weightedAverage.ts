// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData,
  HttpCode,
  ParamsObject,
  Param,
  InputField,
} from 'aalto-grades-common/types';
import * as yup from 'yup';

import {registerFormula} from '.';
import {Formula, Status} from 'aalto-grades-common/types';
import {ApiError, CalculationResult} from '../types';

const childParams: Array<Param> = [
  {name: 'weight', inputField: InputField.Text},
];
const params: Array<string> = [];

const defaultChildParams: ChildParams = {
  weight: 0,
};

interface ChildParams {
  weight: number;
}

type Params = ParamsObject<ChildParams>;

/**
 * Calculates the weighted average grade based on sub-grades.
 * @param {AttainmentData} attainment - Data of the main attainment.
 * @param {Array<CalculationResult>} subGrades - An array of calculation results for sub-grades.
 * @returns {CalculationResult} Returns the weighted average calculation result.
 * @throws {ApiError} Throws an error if a weight is unspecified for any sub-grade attainment.
 */
function calculateWeightedAverage(
  attainment: AttainmentData,
  subGrades: Array<CalculationResult>
): CalculationResult {
  let grade: number = 0;
  let status: Status = Status.Pass;
  const params: Params = attainment.formulaParams as Params;
  const weights: Map<string, ChildParams> = new Map(params.children);

  for (const subGrade of subGrades) {
    if (subGrade.status !== Status.Pass) status = Status.Fail;

    const weight: number | undefined = weights.get(subGrade.attainment.name)
      ?.weight;
    if (weight) {
      grade += subGrade.grade * weight;
    } else {
      throw new ApiError(
        `weight unspecified for attainment ${subGrade.attainment.name}`,
        HttpCode.InternalServerError
      );
    }
  }

  return {
    attainment: attainment,
    grade: grade,
    status: status,
  };
}

const codeSnippet: string = `interface ChildParams {
  weight: number
}

type Params = ParamsObject<ChildParams>;

function calculateWeightedAverage(
  attainment: AttainmentData,
  subGrades: Array<CalculationResult>
): CalculationResult {

  let grade: number = 0;
  let status: Status = Status.Pass;
  const params: Params = attainment.formulaParams as Params;
  const weights: Map<string, ChildParams> = new Map(params.children);

  for (const subGrade of subGrades) {
    if (subGrade.status !== Status.Pass)
      status = Status.Fail;

    const weight: number | undefined = weights.get(subGrade.attainment.name)?.weight;
    if (weight) {
      grade += subGrade.grade * weight;
    } else {
      throw new ApiError(
        \`weight unspecified for attainment \${subGrade.attainment.name}\`,
        HttpCode.InternalServerError
      );
    }
  }

  if (grade < params.minRequiredGrade)
    status = Status.Fail;

  return {
    attainment: attainment,
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
  defaultChildParams,
  yup
    .object({
      minRequiredGrade: yup.number().min(0).notRequired(),
      children: yup
        .array()
        .min(1)
        .of(
          yup.tuple([
            yup.string(),
            yup
              .object({
                weight: yup.number().required(),
              })
              .noUnknown()
              .strict(),
          ])
        )
        .required(),
    })
    .noUnknown()
    .strict()
);
