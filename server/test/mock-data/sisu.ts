// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {SisuCourseInstance, SisuError} from '../../src/types';

export const sisuInstance: SisuCourseInstance = {
  id: 'aalto-CUR-163498-3084205',
  code: 'ELEC-A7100',
  startDate: new Date('2023-01-09'),
  endDate: new Date('2023-05-16'),
  type: 'teaching-participation-lectures',
  name: {
    fi: 'Basic Course in C programming, Luento-opetus',
    sv: 'Basic Course in C programming, Föreläsning',
    en: 'Basic Course in C programming, Lecture',
  },
  summary: {
    workload: {
      fi:
        '4 h lectures assisted programming exercises with voluntary participation. ' +
        'There will be about 10 h of weekly exercise hours that can be taken as needed. ' +
        '120 h individual study',
      sv:
        '4 h lectures assisted programming exercises with voluntary participation. ' +
        'There will be about 10 h of weekly exercise hours that can be taken as needed. ' +
        '120 h individual study',
      en:
        '4 h lectures assisted programming exercises with voluntary participation. ' +
        'There will be about 10 h of weekly exercise hours that can be taken as needed. ' +
        '120 h individual study',
    },
    prerequisites: {
      fi: 'Basics in proramming (for example CS-A1111).',
      sv: 'Basics in proramming (for example CS-A1111).',
      en: 'Basics in proramming (for example CS-A1111).',
    },
    learningOutcomes: {
      fi:
        'The student knows the basics of C programming language and can write ' +
        'short programs using the C language.',
      sv:
        'The student knows the basics of C programming language and can write ' +
        'short programs using the C language.',
      en:
        'The student knows the basics of C programming language and can write ' +
        'short programs using the C language.',
    },
    literature: {
      en:
        'Study materials and exercises are available in the web. Study ' +
        'materials and exercises are available also in Finnish.',
      fi:
        'Study materials and exercises are available in the web. Study ' +
        'materials and exercises are available also in Finnish.',
      sv:
        'Study materials and exercises are available in the web. Study ' +
        'materials and exercises are available also in Finnish.',
    },
    languageOfInstruction: {
      fi: 'en',
      sv: 'en',
      en: 'en',
    },
    registration: {
      fi: '',
      sv: '',
      en: '',
    },
    homepage: {},
    content: {
      fi:
        'Basic concepts of systems-level programming. Basics of the C ' +
        'programming language. Dynamic memory management and its application ' +
        'in common data structures. Basic use of programming and debugging ' +
        'tools for C. Small programming exercises in C.',
      sv:
        'Basic concepts of systems-level programming. Basics of the C ' +
        'programming language. Dynamic memory management and its application ' +
        'in common data structures. Basic use of programming and debugging ' +
        'tools for C. Small programming exercises in C.',
      en:
        'Basic concepts of systems-level programming. Basics of the C ' +
        'programming language. Dynamic memory management and its application ' +
        'in common data structures. Basic use of programming and debugging ' +
        'tools for C. Small programming exercises in C.',
    },
    cefrLevel: '',
    level: {
      fi: 'basic-studies',
      sv: 'basic-studies',
      en: 'basic-studies',
    },
    teacherInCharge: ['Ted Teacher'],
    assesmentMethods: {
      fi: 'Exercises and programming test. ',
      sv: 'Exercises and programming test.',
      en: 'Exercises and programming test.',
    },
    substitutes: {
      fi: 'ELEC-A1100, AS-0.101/AS-0.1101/AS-0.1103',
      sv: 'ELEC-A1100, AS-0.101/AS-0.1101/AS-0.1103',
      en: 'ELEC-A1100, AS-0.101/AS-0.1101/AS-0.1103',
      courseUnits: [
        [
          {
            courseUnitGroupId: 'aalto-OPINKOHD-1113219258',
            credits: null,
          },
        ],
      ],
    },
    additionalInformation: {
      fi:
        'Opetusperiodi: 2020-2021 Spring III-V2021-2022 Spring III-VKurssin ' +
        'kotisivu: https://mycourses.aalto.fi/course/search.php?search&#61;ELEC-A7100' +
        'Ilmoittautuminen: Lukuvuonna 2021-2022 opetukseen ilmoittaudutaan ' +
        'WebOodin sijaan Sisussa (sisu.aalto.fi).WebOodi',
      sv:
        'Undervisningsperiod: 2020-2021 Spring III-V2021-2022 Spring III-VKursens ' +
        'webbplats: https://mycourses.aalto.fi/course/search.php?search&#61;ELEC-A7100Anmälning: ' +
        'Anmälan till undervisningen för läsåret 2021-2022 sker i Sisu, inte i WebOodi.WebOodi',
      en:
        'Teaching Period: 2020-2021 Spring III-V2021-2022 Spring III-VCourse ' +
        'Homepage: https://mycourses.aalto.fi/course/search.php?search&#61;ELEC-A7100' +
        'Registration for Courses: In the academic year 2021-2022, registration for ' +
        'courses will take place on Sisu (sisu.aalto.fi) instead of WebOodi.WebOodi',
    },
    gradingScale: {
      fi: '0-5',
      sv: '0-5',
      en: '0-5',
    },
    teachingPeriod: {
      fi: '2020-2021 Spring III-V, 2021-2022 Spring III-V',
      en: '2020-2021 Spring III-V, 2021-2022 Spring III-V',
      sv: '2020-2021 Spring III-V, 2021-2022 Spring III-V',
    },
  },
  organizations: [
    {
      organisationId: 'aalto-org-t412-20230101',
      educationalInstitutionUrn: null,
      roleUrn: 'urn:code:organisation-role:responsible-organisation',
      share: 1,
      validityPeriod: {},
    },
  ],
  organizationId: 'T412',
  organizationName: {
    fi: 'Informaatio- ja tietoliikennetekniikan laitos',
    sv: 'Institutionen för informations- och kommunikationsteknik',
    en: 'Department of lnformation and Communications Engineering',
  },
  credits: {
    min: 5,
    max: 5,
  },
  courseUnitId: 'aalto-OPINKOHD-1117556432-20210801',
  languageOfInstructionCodes: ['en'],
  teachers: ['Ted Teacher'],
  enrolmentStartDate: '2022-12-12',
  enrolmentEndDate: '2023-01-16',
  mincredits: '5',
  studySubGroups: [
    {
      id: 'aalto-ssg-3112-163497-1-01',
      name: {
        en: 'L01',
        fi: 'L01',
        sv: 'L01',
      },
      type: {
        en: 'Lecture',
        fi: 'Luento',
        sv: 'Föreläsning',
      },
    },
    {
      id: 'aalto-ssg-3112-163498-7-01',
      name: {
        en: 'XXH01',
        fi: 'XXH01',
        sv: 'XXH01',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
    {
      id: 'aalto-ssg-3112-163499-7-01',
      name: {
        en: 'XXH02',
        fi: 'XXH02',
        sv: 'XXH02',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
    {
      id: 'aalto-ssg-3112-163500-7-01',
      name: {
        en: 'XXH03',
        fi: 'XXH03',
        sv: 'XXH03',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
    {
      id: 'aalto-ssg-3112-163501-7-01',
      name: {
        en: 'XXH04',
        fi: 'XXH04',
        sv: 'XXH04',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
    {
      id: 'aalto-ssg-3112-163502-7-01',
      name: {
        en: 'XXH05',
        fi: 'XXH05',
        sv: 'XXH05',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
    {
      id: 'aalto-ssg-3112-163503-7-01',
      name: {
        en: 'XXH06',
        fi: 'XXH06',
        sv: 'XXH06',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
    {
      id: 'aalto-ssg-3112-163504-7-01',
      name: {
        en: 'XXH07',
        fi: 'XXH07',
        sv: 'XXH07',
      },
      type: {
        en: 'Exercise',
        fi: 'Harjoitus',
        sv: 'Övning',
      },
    },
  ],
};

// Course not found
export const sisuError: SisuError = {
  error: {
    code: 102,
    message: 'Course unit realisation not found',
  },
};
