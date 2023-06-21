// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { getFormulaImplementation } from '../../src/formulas';
import { Status } from '../../src/types/grades';
import {
  Formula,
  FormulaImplementation,
  CalculationInput,
  CalculationResult,
} from '../../src/types/formulas';

describe('Test weighted average calculation', () => {
  it('should accept parameters of the appropriate form', async () => {
    const implementation: FormulaImplementation =
      await getFormulaImplementation(Formula.WeightedAverage);
    await implementation.paramSchema.validate({ min: 0, max: 30, weight: 8 });
  });

  it('should forbid parameters of invalid form', async () => {
    // Test with both missing and extra inputs. Incorrect types should raise error also.
    const implementation: FormulaImplementation =
      await getFormulaImplementation(Formula.WeightedAverage);
    for (
      const invalid of [
        {},
        { min: 0, max: 30 },
        { min: 0, max: 30, Weight: 8 },
        { min: 0, max: 30, mix: 8 },
        { min: 0, max: 30, mix: 999, weight: 8 },
        { min: 'x', max: 30, weight: 8 },
        { min: 0, max: 'x', weight: 8 },
        { min: 0, max: 30, weight: 'x' },
        { min: 31, max: 30, weight: 8 }
      ]
    ) {
      await expect(() => implementation.paramSchema.validate(invalid)).rejects.toThrow();
    }
  });

  it('should calculate a passing grade when subgrades are passing', async () => {
    const implementation: FormulaImplementation =
      await getFormulaImplementation(Formula.WeightedAverage);
    const input: Array<CalculationInput> = [
      { params: { min: 0, max: 20, weight: 0.3 }, subResult: { grade: 10, status: Status.Pass } },
      { params: { min: 0, max: 20, weight: 0.7 }, subResult: { grade: 14, status: Status.Pass } },
      { params: { min: 0, max: 3, weight: 1 }, subResult: { grade: 3, status: Status.Pass } },
    ];
    const computedGrade: CalculationResult = await implementation.formulaFunction(input);
    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Pass);
  });

  it('should calculate a failing grade when a subgrade is failing', async () => {
    const implementation: FormulaImplementation =
      await getFormulaImplementation(Formula.WeightedAverage);
    const input: Array<CalculationInput> = [
      { params: { min: 0, max: 20, weight: 0.3 }, subResult: { grade: 10, status: Status.Pass } },
      { params: { min: 0, max: 20, weight: 0.7 }, subResult: { grade: 14, status: Status.Fail } },
      { params: { min: 0, max: 3, weight: 1 }, subResult: { grade: 3, status: Status.Fail } },
    ];
    const computedGrade: CalculationResult = await implementation.formulaFunction(input);
    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Fail);
  });
});
