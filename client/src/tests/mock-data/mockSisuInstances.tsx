// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseInstanceData, GradingScale, Language} from '@common/types';

export const mockSisuInstances: Array<CourseInstanceData> = [
  {
    sisuCourseInstanceId: 'mock-id-1',
    startDate: '2022-08-14',
    endDate: '2022-11-13',
    type: 'teaching-participation-lectures',
    courseData: {
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          name: 'Elisa Mekler',
        },
        {
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
    sisuCourseInstanceId: 'mock-id-2',
    startDate: '2021-08-14',
    endDate: '2021-11-13',
    type: 'exam-exam',
    courseData: {
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
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
    sisuCourseInstanceId: 'mock-id-3',
    startDate: '2023-02-06',
    endDate: '2023-05-19',
    type: 'exam-exam',
    courseData: {
      courseCode: 'CS-A1150',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
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
