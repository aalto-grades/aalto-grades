// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Formula, Status} from '@common/types';

import {mockAttainment} from '../mock-data/attainment';
import {getFormulaImplementation} from '../../src/formulas';
import {CalculationResult, FormulaImplementation} from '../../src/types';

describe('Test Rise Bonus Formula calculation', () => {
  const implementation: FormulaImplementation = getFormulaImplementation(
    Formula.RiseBonus
  );

  it('should accept parameters of the appropriate form', async () => {
    await implementation.paramSchema.validate({
      children: [
        ['1', {gradingType: 'BASE'}],
        ['2', {gradingType: 'BONUS', minBonusGrade: 2}],
      ],
    });
  });
  it('should forbid if number of BASE parameters less than one', async () => {
    await expect(() =>
      implementation.paramSchema.validate({
        children: [
          ['1', {gradingType: 'BONUS', minBonusGrade: 2}],
          ['2', {gradingType: 'BONUS', minBonusGrade: 2}],
        ],
      })
    ).rejects.toThrow();
  });
  it('should forbid if number of BASE parameters more than one', async () => {
    await expect(() =>
      implementation.paramSchema.validate({
        children: [
          ['1', {gradingType: 'BASE'}],
          ['2', {gradingType: 'BASE'}],
        ],
      })
    ).rejects.toThrow();
  });
  it('should forbid parameters of invalid form', async () => {
    // Test with both missing and extra inputs. Incorrect types should raise error also.
    for (const invalid of [
      {},
      {gradingType: '1'},
      {gradingType: null},
      {random: 'BASE'},
      {gradingType: 'BONUS'},
      {minBonusGrade: 1},
      {gradingType: 'BONUS', minBonusGrade: 'kaksi'},
    ]) {
      await expect(() =>
        implementation.paramSchema.validate(['name', invalid])
      ).rejects.toThrow();
    }
  });

  it('should calculate a passing grade when subgrades are passing', async () => {
    const subGrades: Array<CalculationResult> = [
      {
        attainment: {...mockAttainment, name: 'one'},
        grade: 10,
        status: Status.Pass,
      },
      {
        attainment: {...mockAttainment, name: 'two'},
        grade: 14,
        status: Status.Pass,
      },
      {
        attainment: {...mockAttainment, name: 'three'},
        grade: 3,
        status: Status.Pass,
      },
    ];

    const computedGrade: CalculationResult = implementation.formulaFunction(
      {
        ...mockAttainment,
        minRequiredGrade: 0,
        maxGrade: 20,
        formula: Formula.RiseBonus,
        formulaParams: {
          children: [
            ['one', {gradingType: 'BASE'}],
            ['two', {gradingType: 'BONUS', minBonusGrade: 14}],
            ['three', {gradingType: 'BONUS', minBonusGrade: 4}],
          ],
        },
      },
      subGrades
    );

    expect(computedGrade.grade).toBeCloseTo(11);
    expect(computedGrade.status).toBe(Status.Pass);
  });

  it('should calculate a failing grade when a subgrade is failing', async () => {
    const subGrades: Array<CalculationResult> = [
      {
        attainment: {...mockAttainment, name: 'one'},
        grade: 10,
        status: Status.Pass,
      },
      {
        attainment: {...mockAttainment, name: 'two'},
        grade: 14,
        status: Status.Pass,
      },
      {
        attainment: {...mockAttainment, name: 'three'},
        grade: 3,
        status: Status.Fail,
      },
    ];

    const computedGrade: CalculationResult = implementation.formulaFunction(
      {
        ...mockAttainment,
        minRequiredGrade: 0,
        maxGrade: 20,
        formula: Formula.WeightedAverage,
        formulaParams: {
          children: [
            ['one', {gradingType: 'BASE'}],
            ['two', {gradingType: 'BONUS', minBonusGrade: 14}],
            ['three', {gradingType: 'BONUS', minBonusGrade: 4}],
          ],
        },
      },
      subGrades
    );

    expect(computedGrade.grade).toBeCloseTo(11);
    expect(computedGrade.status).toBe(Status.Fail);
  });
  it('should throw error when parameters missing', async () => {
    const subGrades: Array<CalculationResult> = [
      {
        attainment: {...mockAttainment, name: 'one'},
        grade: 10,
        status: Status.Pass,
      },
      {
        attainment: {...mockAttainment, name: 'two'},
        grade: 14,
        status: Status.Pass,
      },
      {
        attainment: {...mockAttainment, name: 'three'},
        grade: 3,
        status: Status.Fail,
      },
    ];

    expect(() => {
      implementation.formulaFunction(
        {
          ...mockAttainment,
          minRequiredGrade: 0,
          maxGrade: 20,
          formula: Formula.WeightedAverage,
          formulaParams: {
            children: [
              ['one', {gradingType: 'BASE'}],
              ['two', {gradingType: 'BONUS'}],
              ['three', {gradingType: 'BONUS', minBonusGrade: 4}],
            ],
          },
        },
        subGrades
      );
    }).toThrow();
  });
});
