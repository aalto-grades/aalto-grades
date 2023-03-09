// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockInstances = [
  { 
    id: 1,
    startingPeriod: '2021-2022 Autumn I-II',
    endingPeriod: '2022-2023 Autumn I-II',
    minCredits: 5,
    maxCredits: 5,
    startDate: new Date(2022, 8, 14),
    endDate: new Date(2022, 11, 13),
    type: 'Lecture',
    gradingScale: 'General Scale, 0-5',
    teachersInCharge: [
      'Elisa Mekler',
      'David McGookin'
    ],
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
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
  { 
    id: 2,
    startingPeriod: '2021-2022 Autumn I-II',
    endingPeriod: '2022-2023 Autumn I-II',
    minCredits: 5,
    maxCredits: 5,
    startDate: new Date(2021, 8, 14),
    endDate: new Date(2021, 11, 13),
    type: 'Exam',
    gradingScale: 'General Scale, 0-5',
    teachersInCharge: [
      'Elisa Mekler'
    ],
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
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
  { 
    id: 3,
    startingPeriod: '2019-2020 Autumn I-II',
    endingPeriod: '2020-2021 Autumn I-II',
    minCredits: 5,
    maxCredits: 5,
    startDate: new Date(2020, 8, 8),
    endDate: new Date(2020, 11, 7),
    type: 'Lecture',
    gradingScale: 'General Scale, 0-5',
    teachersInCharge: [
      'Elisa Mekler'
    ],
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
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
  { 
    id: 4,
    startingPeriod: '2019-2020 Autumn I-II',
    endingPeriod: '2020-2021 Autumn I-II',
    minCredits: 5,
    maxCredits: 5,
    startDate: new Date(2019, 8, 9),
    endDate: new Date(2019, 11, 8),
    type: 'Lecture',
    gradingScale: 'General Scale, 0-5',
    teachersInCharge: [
      'Elisa Mekler'
    ],
    courseData: {
      id: 1,
      courseCode: 'CS-C3120',
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
  {
    id: 5, 
    startingPeriod: '-', 
    endingPeriod: '-', 
    startDate: new Date(2023, 2, 6),
    endDate: new Date(2023, 5, 19),
    minCredits: 5, 
    maxCredits: 5, 
    type: 'Lecture',
    gradingScale: 'General Scale, 0-5', 
    teachersInCharge: [
      'Kerttu Maaria Pollari-Malmi'
    ],
    courseData: {
      id: 2,
      courseCode: 'CS-A1150', 
      department: {
        en: 'Department of Computer Science',
        fi: 'Tietotekniikan laitos',
        sv: 'Institutionen för datateknik'
      },
      name: {
        en: 'Databases, Lecture',
        fi: 'Tietokannat, Luento-opetus',
        sv: 'Databaser, Föreläsning'
      }
    }
  }
];

export default mockInstances;
