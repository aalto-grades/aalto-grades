// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockSisuInstances = [
  { sisuCourseInstanceId: 'mock-id-1',
    startingPeriod: '2021-2022 Autumn I-II',
    endingPeriod: '2022-2023 Autumn I-II',
    minCredits: 5,
    maxCredits: 5,
    startDate: '2022-08-14',
    endDate: '2022-11-13',
    teachingMethod: 'LECTURE',
    gradingScale: 'General Scale, 0-5',
    responsibleTeachers: [
      'Elisa Mekler',
      'David McGookin'
    ],
    courseData: {
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
  { sisuCourseInstanceId: 'mock-id-2',
    startingPeriod: '2021-2022 Autumn I-II',
    endingPeriod: '2022-2023 Autumn I-II',
    startDate: '2021-08-14',
    endDate: '2021-11-13',
    teachingMethod: 'EXAM',
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
  },
  {
    sisuCourseInstanceId: 'mock-id-3', 
    startingPeriod: '-', 
    endingPeriod: '-', 
    startDate: '2023-02-06', 
    endDate: '2023-05-19', 
    teachingMethod: 'EXAM',
    gradingType: 'NUMERICAL', 
    responsibleTeachers: [
      'Kerttu Maaria Pollari-Malmi'
    ],
    courseData: {
      courseCode: 'CS-A1150', 
      minCredits: 5, 
      maxCredits: 5, 
      department: {
        en: 'Department of Computer Science',
        fi: 'Tietotekniikan laitos',
        sv: 'Institutionen för datateknik'
      },
      name: {
        en: 'Databases, Lecture',
        fi: 'Tietokannat, Luento-opetus',
        sv: 'Databaser, Föreläsning'
      },
      evaluationInformation: { 
        en: 'Final examination and an compulsory assignment. Possibility to get extra credits from exercises.',
        fi: 'Tentti ja pakollinen harjoitustyö. Mahdollisuus saada lisäpisteitä harjoitustehtävistä. ',
        sv: 'Tentamen samt ett obligatoriskt övningsarbete. Räkneövningarna ger möjlighet till tilläggspoäng.' 
      }
    }
  }
];

export default mockSisuInstances;
