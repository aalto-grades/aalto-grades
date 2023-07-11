// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import TeacherInCharge from '../../src/database/models/teacherInCharge';

export const mockTeacher: TeacherInCharge = new TeacherInCharge({
  userId: 1,
  courseId: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}, { isNewRecord: false });
