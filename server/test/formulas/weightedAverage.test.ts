// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, Formula, Status } from 'aalto-grades-common/types';
import { getFormulaImplementation } from '../../src/formulas';
import { FormulaImplementation } from '../../src/types/formulas';

describe('Test weighted average calculation', () => {
  const implementation: FormulaImplementation =
    getFormulaImplementation(Formula.WeightedAverage);

  it('should accept parameters of the appropriate form', async () => {
    await implementation.paramSchema.validate({ weights: [[1, 8]] });
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
    const subGrades: Array<AttainmentGradeData> = [
      { attainmentId: 2, grade: 10, status: Status.Pass, manual: true },
      { attainmentId: 3, grade: 14, status: Status.Pass, manual: true },
      { attainmentId: 4, grade: 3, status: Status.Pass, manual: true }
    ];

    const computedGrade: AttainmentGradeData = implementation.formulaFunction(1,
      {
        weights: [
          [2, 0.3],
          [3, 0.7],
          [4, 1]
        ]
      },
      subGrades
    );

    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Pass);
  });

  it('should calculate a failing grade when a subgrade is failing', async () => {
    const subGrades: Array<AttainmentGradeData> = [
      { attainmentId: 2, grade: 10, status: Status.Pass, manual: true },
      { attainmentId: 3, grade: 14, status: Status.Pass, manual: true },
      { attainmentId: 4, grade: 3, status: Status.Fail, manual: true }
    ];

    const computedGrade: AttainmentGradeData = implementation.formulaFunction(1,
      {
        weights: [
          [2, 0.3],
          [3, 0.7],
          [4, 1]
        ]
      },
      subGrades
    );

    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Fail);
  });
});
