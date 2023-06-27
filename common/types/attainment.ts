// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface AttainmentData {
  id?: number,
  assessmentModelId?: number,
  parentId?: number,
  tag: string,
  name: string,
  daysValid: number,
  subAttainments?: Array<AttainmentData>
}

export interface AssessmentModelData {
  id: number,
  courseId: number,
  name: string
}
