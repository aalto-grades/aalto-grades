// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula } from "./formula"

export interface AttainmentData {
  id?: number,
  assessmentModelId?: number,
  parentId?: number,
  tag: string,
  name: string,
  formula?: Formula,
  formulaParams?: object,
  daysValid: number,
  subAttainments?: Array<AttainmentData>
}

export interface AssessmentModelData {
  id?: number,
  courseId?: number,
  name: string
}
