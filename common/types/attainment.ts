// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, ParamsObject } from "./formula"

export interface AttainmentData {
  id?: number,
  assessmentModelId?: number,
  parentId?: number,
  name: string,
  daysValid: number,
  minRequiredGrade: number,
  maxGrade: number,
  formula: Formula,
  formulaParams: ParamsObject,
  subAttainments?: Array<AttainmentData>
}

export interface AssessmentModelData {
  id?: number,
  courseId?: number,
  name: string
}
