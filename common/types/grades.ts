// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DateOnlyString} from './general';
import {UserData} from './user';

export enum Status {
  Pass = 'PASS',
  Fail = 'FAIL',
  Pending = 'PENDING',
}

export interface GradeOption {
  gradeId?: number;
  grader: UserData;
  grade: number;
  status: Status;
  manual: boolean;
  exportedToSisu?: Date;
  date?: Date | DateOnlyString;
  expiryDate?: Date | DateOnlyString;
  comment: string;
}

export type NewGrade = {
  studentNumber: string;
  attainmentId: number;
  grade: number;
  date?: Date;
  expiryDate?: Date;
  comment: string;
};

export interface AttainmentGradeData {
  userId?: number;
  attainmentId: number;
  attainmentName?: string;
  grades: Array<GradeOption>;
  subAttainments?: Array<AttainmentGradeData>;
}

//This is one element of what we receive from the backend API
export interface StudentGradesTree {
  userId: number;
  studentNumber: string;
  attainmentId: number;
  attainmentName?: string;
  credits: number;
  grades: Array<GradeOption>;
  subAttainments?: Array<AttainmentGradeData>;
}

export type AttainmentGradesData = {
  attainmentId: number;
  attainmentName?: string;
  grades: Array<GradeOption>;
};

export type studentRow = {
  user: UserData;
  finalGrades?: FinalGrade[];
  attainments: Array<AttainmentGradesData>;
};

// TODO: Replace with a better name
export interface FinalGrade {
  userId: number;
  studentNumber: string;
  credits: number;
  grades: Array<GradeOption>;
}

export interface EditGrade {
  grade?: number;
  status?: Status;
  date?: Date | DateOnlyString;
  expiryDate?: Date | DateOnlyString;
  comment?: string;
}
