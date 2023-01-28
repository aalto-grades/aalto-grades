// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const dummyInstances = [
  { id: 'mock-id-1',
    startingPeriod: '2022-2023 Autumn I-II',
    endingPeriod: '2022-2023 Autumn I-II',
    startDate: '2022-08-14',
    endDate: '2022-11-13',
    type: 'LECTURE',
    gradingScale: 'General Scale, 0-5',
    responsibleTeachers: [
      'Elisa Mekler',
      'David McGookin'
    ],
    courseData: {
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      department: {
        en: 'Department of computer science',
        fi: 'Department of computer science',
        sv: 'Department of computer science',
      },
      name: {
        en: 'Human-Computer Interaction',
        fi: 'Human-Computer Interaction',
        sv: 'Human-Computer Interaction',
      }
    }
  },
  { id: 'mock-id-2',
    startingPeriod: '2021-2022 Autumn I-II',
    endingPeriod: '2021-2022 Autumn I-II',
    startDate: '2021-08-14',
    endDate: '2021-11-13',
    type: 'Exam',
    gradingScale: 'General Scale, 0-5',
    responsibleTeachers: [
      'Elisa Mekler'
    ],
    courseData: {
      courseCode: 'CS-C3120',
      minCredits: 5,
      maxCredits: 5,
      department: {
        en: 'Department of computer science',
        fi: 'Department of computer science',
        sv: 'Department of computer science',
      },
      name: {
        en: 'Human-Computer Interaction',
        fi: 'Human-Computer Interaction',
        sv: 'Human-Computer Interaction',
      }
    }
  }
];

export default dummyInstances;
