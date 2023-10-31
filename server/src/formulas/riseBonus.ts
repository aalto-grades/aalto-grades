// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData,
  HttpCode,
  ParamsObject,
} from 'aalto-grades-common/types';
import * as yup from 'yup';

import {registerFormula} from '.';
import {Formula, Status} from 'aalto-grades-common/types';
import {ApiError, CalculationResult} from '../types';

const childParams: Array<string> = ['grading', 'riseGrade'];
const params: Array<string> = [];

enum Grading {
  Main = 1,
  Rise = 2,
}

const defaultChildParams: ChildParams = {
  grading: Grading.Rise,
  riseGrade: 2,
};

interface ChildParams {
  grading: Grading;
  riseGrade?: number;
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
    )?.grading;
    const riseGrade: number | undefined = nameToChildParams.get(
      subGrade.attainment.name
    )?.riseGrade;
    if (gradingType && riseGrade && gradingType === Grading.Rise) {
      bonus = subGrade.grade > riseGrade ? bonus + 1 : bonus;
    } else if (gradingType && gradingType === Grading.Main) {
      if (mainFound) {
        throw new ApiError(
          `Multiple main grades for attainment ${subGrade.attainment.name}`,
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
                grading: yup
                  .mixed<Grading>()
                  .oneOf(Object.values(Grading) as number[])
                  .required(),
                riseGrade: yup.number(),
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
