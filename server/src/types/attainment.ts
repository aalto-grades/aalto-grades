// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface AttainmentRequestData {
  parentId?: number,
  name: string,
  date: Date,
  expiryDate: Date,
  subAttainments: Array<AttainmentRequestData>
}

export interface AttainmentData {
  id: number,
  courseId: number,
  courseInstanceId: number,
  parentId?: number,
  tag: string,
  name: string,
  date: Date,
  expiryDate: Date,
  subAttainments?: Array<AttainmentData>
}

