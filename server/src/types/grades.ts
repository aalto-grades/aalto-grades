// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData } from 'aalto-grades-common/types';

export interface StudentGrades {
  // User's ID (PK) in the database user table.
  id?: number,
  studentNumber: string,
  grades: Array<AttainmentGradeData>
}
