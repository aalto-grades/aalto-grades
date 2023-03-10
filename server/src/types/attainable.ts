// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface AttainableRequestData {
  parentId?: number,
  name: string,
  date: Date,
  expiryDate: Date,
  subAttainments: Array<AttainableRequestData>
}

export interface AttainableData {
  id: number,
  courseId: number,
  courseInstanceId: number,
  parentId?: number,
  tag: string,
  name: string,
  date: Date,
  expiryDate: Date,
  subAttainables?: Array<AttainableData>
  subAttainments?: Array<AttainableData>
}

export enum Formula {
  MANUAL = 'MANUAL',
  WEIGHTED_AVERAGE = 'WEIGHTED_AVERAGE',
}
export interface FormulaParams {
  min: number;
  max: number;
}
