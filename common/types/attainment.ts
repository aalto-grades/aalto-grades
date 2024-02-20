// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Formula, ParamsObject} from './formula';

export enum GradeType {
  Integer = 'INTEGER',
  Float = 'FLOAT',
}

export interface AttainmentData {
  id: number;
  courseId?: number;
  name: string;
  daysValid?: number;
}

export interface AssessmentModelData {
  id?: number;
  courseId?: number;
  name: string;
  graphStructure?: JSON;
}
