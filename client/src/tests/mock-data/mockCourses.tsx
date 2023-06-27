// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types/course';

const mockCourses: Array<CourseData> = [
  {
    id: 5,
    courseCode: 'CS-A1150',
    minCredits: 5,
    maxCredits: 5,
    department: {
      fi: 'Tietotekniikan laitos',
      sv: 'Institutionen för datateknik',
      en: 'Department of Computer Science'
    },
    name: {
      fi: 'Tietokannat',
      sv: 'Databaser',
      en: 'Databases'
    },
    evaluationInformation: {
      fi:'',
      sv:'',
      en:''
    },
    teachersInCharge: [
      {
        id: 45,
        name: 'Scooby Doo'
      }
    ]
  },
  {
    id: 1,
    courseCode: 'CS-A1110',
    minCredits: 5,
    maxCredits: 5,
    department: {
      fi: 'Tietotekniikan laitos',
      sv: 'Institutionen för datateknik',
      en: 'Department of Computer Science'
    },
    name: {
      fi: 'Ohjelmointi 1',
      sv: 'Programmering 1',
      en: 'Programming 1'
    },
    evaluationInformation: {
      fi:'',
      sv:'',
      en:''
    },
    teachersInCharge: [
      {
        id: 76,
        name: 'Winnie the Pooh'
      }
    ]
  }
];

export default mockCourses;
