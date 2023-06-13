// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as yup from 'yup';

export interface AttainmentRequestData {
  parentId?: number,
  name: string,
  tag: string,
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

export const treeSchema: yup.AnyObjectSchema = yup.object().shape({
  tree: yup.string().oneOf(['children', 'descendants'])
}).noUnknown(true).strict();

