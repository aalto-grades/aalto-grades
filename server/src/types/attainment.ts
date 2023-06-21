// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface AttainmentRequestData {
  parentId?: number,
  name: string,
  tag: string,
  daysValid: number,
  subAttainments: Array<AttainmentRequestData>
}

export interface AttainmentData {
  id: number,
  assessmentModelId: number,
  parentId?: number,
  tag: string,
  name: string,
  daysValid: number,
  subAttainments?: Array<AttainmentData>
}

export interface AssessmentMethodData {
  id: number,
  courseId: number,
  name: string
  // TODO: Attainment tree?
}
