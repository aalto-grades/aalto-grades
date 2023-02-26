// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface AssignmentParams {
  min: number;
  max: number;
  [key: string]: any;
}
export type ManuallyGradedParams = {
  min: number;
  max: number;
}
export type GradeCalculator<P extends AssignmentParams> = (
  subGrades: P extends ManuallyGradedParams ? number : Array<number>,
  parameters: P
) => Promise<number>;

export abstract class Assignment<P extends AssignmentParams> {
  public abstract calculateGrade(subGrades: this extends ManuallyGradedAssignment ? number: Array<number>): Promise<number>;
  protected parameters: P;

  constructor(parameters: P) {
    this.parameters = parameters;
  }
}

export class ManuallyGradedAssignment extends Assignment<ManuallyGradedParams> {
  public async calculateGrade(subGrade: number): Promise<number> {
    return subGrade;
  }
}

export type WeightedAssignmentParams = {
  min: number,
  max: number,
  weights: Array<number>,
}

export class WeightedAssignment extends Assignment<WeightedAssignmentParams> {
  public async calculateGrade(subGrades: Array<number>): Promise<number> {
    let weighted = this.parameters.weights.reduce((acc, weight, i) => acc + weight * (subGrades[i] || 0), 0);
    return weighted;
  }
}
