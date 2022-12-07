// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Course } from './course';

export interface TeacherCourses {
  current: Array<Course>,
  previous: Array<Course>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getTeacherCourses(userId: number): Promise<TeacherCourses> {
  return {
    current: [
      {
        id: 0,
        courseCode: 'CS-E4580',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Department of Computer Science'
        },
        name: {
          fi: '',
          sv: '',
          en: 'Programming Parallel Computers D'
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      }
    ],
    previous: [
      {
        id: 1,
        courseCode: 'ELEC-C7241',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Department of Communications and Networking'
        },
        name: {
          fi: 'Tietokoneverkot',
          sv: '',
          en: ''
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      },
      {
        id: 2,
        courseCode: 'CS-C3120',
        minCredits: 5,
        maxCredits: 5,
        department: {
          fi: '',
          sv: '',
          en: 'Department of Communications and Networking'
        },
        name: {
          fi: '',
          sv: '',
          en: 'Human-Computer Interaction'
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      }
    ]
  };
}
