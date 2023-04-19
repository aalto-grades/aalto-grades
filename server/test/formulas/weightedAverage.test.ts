import { getFormulaImplementation } from "../../src/formulas";
import { Formula, GradingInput, Status } from "../../src/types/formulas";

describe('Test weighted average calculation', () => {
  it('should accept parameters of the appropriate form', async () => {
    let implementation = await getFormulaImplementation(Formula.WeightedAverage);
    await implementation.paramSchema.validate({ min: 0, max: 30, weight: 8 });
  });
  it('should forbid parameters of invalid form', async () => {
    let implementation = await getFormulaImplementation(Formula.WeightedAverage);
    for (
      const invalid of [
        {},
        { min: 0, max: 30 },
        { min: 0, max: 30, Weight: 8 },
        { min: 0, max: 30, mix: 8 },
        // The yup library allows extra fields, which might be okay.
        // { min: 0, max: 30, mix: 999, weight: 8 },
      ]
    ) {
      await expect(() => implementation.paramSchema.validate(invalid)).rejects.toThrow();
    }
  });
  it('should calculate a passing grade when subgrades are passing', async () => {
    let implementation = await getFormulaImplementation(Formula.WeightedAverage);
    const input: Array<GradingInput> = [
      { params: { min: 0, max: 20, weight: 0.3 }, subResult: { grade: 10, status: Status.Pass } },
      { params: { min: 0, max: 20, weight: 0.7 }, subResult: { grade: 14, status: Status.Pass } },
      { params: { min: 0, max: 3, weight: 1 }, subResult: { grade: 3, status: Status.Pass } },
    ];
    let computedGrade = await implementation.formulaFunction(input);
    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Pass);
  });
  it('should calculate a failing grade when a subgrade is failing', async () => {
    let implementation = await getFormulaImplementation(Formula.WeightedAverage);
    const input: Array<GradingInput> = [
      { params: { min: 0, max: 20, weight: 0.3 }, subResult: { grade: 10, status: Status.Pass } },
      { params: { min: 0, max: 20, weight: 0.7 }, subResult: { grade: 14, status: Status.Fail } },
      { params: { min: 0, max: 3, weight: 1 }, subResult: { grade: 3, status: Status.Fail} },
    ];
    let computedGrade = await implementation.formulaFunction(input);
    expect(computedGrade.grade).toBeCloseTo(15.8);
    expect(computedGrade.status).toBe(Status.Fail);
  });
});
