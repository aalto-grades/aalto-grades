// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseInstanceData,
  GradingScale,
  Language,
  Period,
} from 'aalto-grades-common/types';

export const mockInstances: Array<CourseInstanceData> = [
  {
    id: 1,
    startingPeriod: Period.I,
    endingPeriod: Period.II,
    startDate: new Date('2023-02-06'),
    endDate: new Date('2023-05-06'),
    type: 'Lecture',
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          id: 10,
          name: 'Elisa Mekler',
        },
        {
          id: 11,
          name: 'David McGookin',
        },
      ],
      department: {
        en: 'Department of computer science',
        fi: 'Department of computer science',
        sv: 'Department of computer science',
      },
      name: {
        en: 'Human-Computer Interaction',
        fi: 'Human-Computer Interaction',
        sv: 'Human-Computer Interaction',
      },
    },
  },
  {
    id: 2,
    startingPeriod: Period.I,
    endingPeriod: Period.II,
    startDate: new Date('2023-06-06'),
    endDate: new Date('2023-06-06'),
    type: 'Exam',
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          id: 10,
          name: 'Elisa Mekler',
        },
      ],
      department: {
        en: 'Department of computer science',
        fi: 'Department of computer science',
        sv: 'Department of computer science',
      },
      name: {
        en: 'Human-Computer Interaction',
        fi: 'Human-Computer Interaction',
        sv: 'Human-Computer Interaction',
      },
    },
  },
  {
    id: 3,
    startingPeriod: Period.I,
    endingPeriod: Period.II,
    startDate: new Date('2022-09-06'),
    endDate: new Date('2023-09-06'),
    type: 'Lecture',
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          id: 10,
          name: 'Elisa Mekler',
        },
      ],
      department: {
        en: 'Department of computer science',
        fi: 'Department of computer science',
        sv: 'Department of computer science',
      },
      name: {
        en: 'Human-Computer Interaction',
        fi: 'Human-Computer Interaction',
        sv: 'Human-Computer Interaction',
      },
    },
  },
  {
    id: 4,
    startingPeriod: Period.I,
    endingPeriod: Period.II,
    startDate: new Date('2021-09-06'),
    endDate: new Date('2021-011-06'),
    type: 'Lecture',
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          id: 10,
          name: 'Elisa Mekler',
        },
      ],
      department: {
        en: 'Department of computer science',
        fi: 'Department of computer science',
        sv: 'Department of computer science',
      },
      name: {
        en: 'Human-Computer Interaction',
        fi: 'Human-Computer Interaction',
        sv: 'Human-Computer Interaction',
      },
    },
  },
  {
    id: 5,
    startingPeriod: Period.I,
    endingPeriod: Period.II,
    startDate: new Date('2018-09-06'),
    endDate: new Date('2018-011-06'),
    type: 'Lecture',
    courseData: {
      id: 2,
      courseCode: 'CS-A1150',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          id: 12,
          name: 'Kerttu Maaria Pollari-Malmi',
        },
      ],
      department: {
        en: 'Department of Computer Science',
        fi: 'Tietotekniikan laitos',
        sv: 'Institutionen för datateknik',
      },
      name: {
        en: 'Databases, Lecture',
        fi: 'Tietokannat, Luento-opetus',
        sv: 'Databaser, Föreläsning',
      },
    },
  },
];
