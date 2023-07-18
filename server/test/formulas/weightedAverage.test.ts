// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, Status } from 'aalto-grades-common/types';
import { getFormulaImplementation } from '../../src/formulas';
import { CalculationResult, FormulaImplementation } from '../../src/types';

describe('Test weighted average calculation', () => {
  const implementation: FormulaImplementation =
    getFormulaImplementation(Formula.WeightedAverage);

  it('should accept parameters of the appropriate form', async () => {
    await implementation.paramSchema.validate({ children: [['1', { weight: 8 }]] });
  });

  it('should forbid parameters of invalid form', async () => {
    // Test with both missing and extra inputs. Incorrect types should raise error also.
    for (
      const invalid of [
        {},
        { Weights: [[1, 8]] },
        { mix: 8 },
        { mix: 999, weights: [[1, 8]] },
        { weights: [1, 8] },
        { weights: [['1', '8']] }
      ]
    ) {
      await expect(() => implementation.paramSchema.validate(invalid)).rejects.toThrow();
    }
  });

  it('should calculate a passing grade when subgrades are passing', async () => {
    const subGrades: Array<CalculationResult> = [
      { attainmentTag: 'one', grade: 10, status: Status.Pass },
      { attainmentTag: 'two', grade: 14, status: Status.Pass },
      { attainmentTag: 'three', grade: 3, status: Status.Pass }
    ];

    const computedGrade: CalculationResult = implementation.formulaFunction(
      'current',
      {
        children: [
          ['one', { weight: 0.3 }],
          ['two', { weight: 0.7 }],
          ['three', { weight: 1 }]
        ]
      },
      subGrades
    );

    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Pass);
  });

  it('should calculate a failing grade when a subgrade is failing', async () => {
    const subGrades: Array<CalculationResult> = [
      { attainmentTag: 'one', grade: 10, status: Status.Pass },
      { attainmentTag: 'two', grade: 14, status: Status.Pass },
      { attainmentTag: 'three', grade: 3, status: Status.Fail }
    ];

    const computedGrade: CalculationResult = implementation.formulaFunction(
      'current',
      {
        children: [
          ['one', { weight: 0.3 }],
          ['two', { weight: 0.7 }],
          ['three', { weight: 1 }]
        ]
      },
      subGrades
    );

    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Fail);
  });
});
