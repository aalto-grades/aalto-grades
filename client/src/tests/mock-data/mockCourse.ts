// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, GradingScale, Language} from '@common/types';

export const mockCourse: CourseData = {
  id: 1,
  courseCode: 'CS-A????',
  minCredits: 5,
  maxCredits: 5,
  department: {
    fi: 'Tietotekniikan laitos',
    en: 'Department of Computer Science',
    sv: 'Institutionen för datateknik',
  },
  name: {fi: 'Example Average', en: 'Example Average', sv: 'Example Average'},
  gradingScale: GradingScale.Numerical,
  languageOfInstruction: Language.English,
  teachersInCharge: [
    {
      id: 2,
      name: 'Timmy Teacher',
      email: 'teacher@aalto.fi',
      studentNumber: '123456',
    },
  ],
  assistants: [],
};
