// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData,
  HttpCode,
  Param,
  ParamsObject,
  InputField,
  ListParam,
} from 'aalto-grades-common/types';
import * as yup from 'yup';

import {registerFormula} from '.';
import {Formula, Status} from 'aalto-grades-common/types';
import {ApiError, CalculationResult} from '../types';

enum Grading {
  Base = 'BASE',
  Bonus = 'BONUS',
}

const childParams: Array<Param | ListParam> = [
  {name: 'gradingType', inputField: InputField.List, options: ['Base', 'Bonus'], optionsMap: {Base: 'BASE', Bonus: 'BONUS'}},
  {name: 'minBonusGrade', inputField: InputField.Text, requires: {param: 'gradingType', toBe: 'BONUS'}},
];
const params: Array<string> = [];


const defaultChildParams: ChildParams = {
  gradingType: Grading.Base,
  minBonusGrade: 2,
};

interface ChildParams {
  gradingType: Grading;
  minBonusGrade?: number;
}

type Params = ParamsObject<ChildParams>;

/**
 * Calculates the rise bonus grade based on sub-grades.
 * @param {AttainmentData} attainment - Data of the main attainment.
 * @param {Array<CalculationResult>} subGrades - An array of calculation results for sub-grades.
 * @returns {CalculationResult}
 * @throws {ApiError}
 */
function calculateRiseBonus(
  attainment: AttainmentData,
  subGrades: Array<CalculationResult>
): CalculationResult {
  let grade: number = 0;
  let status: Status = Status.Pass;
  let bonus: number = 0;
  let mainFound: boolean = false;
  const params: Params = attainment.formulaParams as Params;
  const nameToChildParams: Map<string, ChildParams> = new Map(params.children);

  for (const subGrade of subGrades) {
    if (subGrade.status !== Status.Pass) status = Status.Fail;
    const gradingType: Grading | undefined = nameToChildParams.get(
      subGrade.attainment.name
    )?.gradingType;
    const bonusGrade: number | undefined = nameToChildParams.get(
      subGrade.attainment.name
    )?.minBonusGrade;
    if (gradingType && bonusGrade && gradingType === Grading.Bonus) {
      bonus = subGrade.grade >= bonusGrade ? bonus + 1 : bonus;
    } else if (gradingType && gradingType === Grading.Base) {
      if (mainFound) {
        throw new ApiError(
          'Multiple base grades for formula',
          HttpCode.InternalServerError
        );
      }
      grade = subGrade.grade;
      mainFound = true;
    } else {
      throw new ApiError(
        `Grading type unspecified for attainment ${subGrade.attainment.name}`,
        HttpCode.InternalServerError
      );
    }
  }
  if (status === Status.Pass) {
    grade = Math.min(attainment.maxGrade, grade + bonus);
  }
  return {
    attainment: attainment,
    grade: grade,
    status: status,
  };
}

const codeSnippet = '';

registerFormula(
  Formula.RiseBonus,
  calculateRiseBonus,
  codeSnippet,
  'Rise bonus',
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
                gradingType: yup
                  .mixed<Grading>()
                  .oneOf(Object.values(Grading))
                  .required(),
                minBonusGrade: yup.number(),
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
