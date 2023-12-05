// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, GradingScale, Language} from 'aalto-grades-common/types';

export const mockCourses: Array<CourseData> = [
  {
    id: 5,
    courseCode: 'CS-A1150',
    minCredits: 5,
    maxCredits: 5,
    gradingScale: GradingScale.Numerical,
    languageOfInstruction: Language.English,
    department: {
      fi: 'Tietotekniikan laitos',
      sv: 'Institutionen för datateknik',
      en: 'Department of Computer Science',
    },
    name: {
      fi: 'Tietokannat',
      sv: 'Databaser',
      en: 'Databases',
    },
    teachersInCharge: [
      {
        id: 45,
        name: 'Scooby Doo',
      },
    ],
  },
  {
    id: 1,
    courseCode: 'CS-A1110',
    minCredits: 5,
    maxCredits: 5,
    gradingScale: GradingScale.Numerical,
    languageOfInstruction: Language.English,
    department: {
      fi: 'Tietotekniikan laitos',
      sv: 'Institutionen för datateknik',
      en: 'Department of Computer Science',
    },
    name: {
      fi: 'Ohjelmointi 1',
      sv: 'Programmering 1',
      en: 'Programming 1',
    },
    teachersInCharge: [
      {
        id: 76,
        name: 'Winnie the Pooh',
      },
    ],
  },
];
