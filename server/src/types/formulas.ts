import { Formula, FormulaParams } from './attainable';
import * as yup from 'yup';

export enum Status {
  Pass = 'pass',
  Fail = 'fail',
}

export interface CalculationResult {
  status: Status;
  points: number | undefined;
}

export interface WeightedAssignmentParams {
  min: number;
  max: number;
  weights: Array<number>;
}

// A FormulaFunction represents a grade formula calculation operation, including
// user-defined parameters and their values.
export type FormulaFunction = (subResults: Array<CalculationResult>) => Promise<CalculationResult>;
// A ParametrizedFormulaFunction represents a grade formula calculation operation,
// without specific parameter values having been bound at the current time.
export type ParameterizedFormulaFunction = (parameters: any, subResults: Array<CalculationResult>) => Promise<CalculationResult>;
// A FormulaNode represents a grade formula calculation operation, including
// information about the formulas that are lower in the hierarchy tree.
export interface FormulaNode {
  validatedFormula: FormulaFunction;
  subFormulaNodes: Array<FormulaNode>;
};

const formulasWithSchema: Map<Formula, [yup.AnyObjectSchema, ParameterizedFormulaFunction]> = new Map();
formulasWithSchema.set(
  Formula.Manual,
  [
    yup.object(),
    // If no points have been input for a student, assume the attainment
    // has been failed.
    async (_subGrades, _params) => { return { status: Status.Fail, points: undefined }; },
  ]
);

async function calculatedWeightedAverage(
  params: WeightedAssignmentParams,
  subResults: Array<CalculationResult>
): Promise<CalculationResult> {
  const weighted: CalculationResult =
    params.weights
      .reduce(
        (
          acc: CalculationResult,
          weight: number,
          i: number,
        ) => {
          if (acc.status == Status.Fail || subResults[i].status == Status.Fail) {
            return { points: undefined, status: Status.Fail };
          }
          return {
            points: (acc.points ?? 0) + weight * (subResults[i].points ?? 0),
            status: Status.Pass,
          };
        },
        { status: Status.Pass, points: 0 }
      );

  return weighted;
}

formulasWithSchema.set(
  Formula.WeightedAverage,
  [
    yup.object({
      min: yup.number().required(),
      max: yup.number().required(),
      weights: yup.array(yup.number().required()).required(),
    }),
    calculatedWeightedAverage,
  ]
);

export const formulaChecker = yup.string().oneOf(Object.values(Formula)).required();

async function validate<P extends FormulaParams>(
  fn: (params: P, subPoints: Array<CalculationResult>) => Promise<CalculationResult>,
  schema: yup.AnyObjectSchema,
  params: unknown,
): Promise<FormulaFunction> {
  await schema.validate(params);
  return (subGrades) => fn(params as P, subGrades);
}

export function getFormula(name: Formula, params: FormulaParams) {
  const formulaWithSchema = formulasWithSchema.get(name)!;
  return validate(formulaWithSchema[1], formulaWithSchema[0], params);
}
