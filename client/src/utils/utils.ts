// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AplusCourseData,
  AplusGradeSourceType,
  AuthData,
  CourseData,
  CourseRoleType,
  GradingScale,
  Language,
  LocalizedString,
  NewAplusGradeSourceData,
} from '@/common/types';
import {LanguageOption} from '../types';

export const getMaxFinalGrade = (gradingScale: GradingScale): number => {
  switch (gradingScale) {
    case GradingScale.Numerical:
      return 5;
    case GradingScale.PassFail:
      return 1;
    case GradingScale.SecondNationalLanguage:
      return 2;
  }
};

export const getCourseRole = (
  course: CourseData,
  auth: AuthData
): CourseRoleType => {
  const {teachersInCharge, assistants} = course;
  const isTeacher = teachersInCharge.find(teacher => teacher.id === auth.id);
  const isAssistant = assistants.find(assistant => assistant.id === auth.id);

  if (isTeacher !== undefined) return CourseRoleType.Teacher;
  if (isAssistant !== undefined) return CourseRoleType.Assistant;
  return CourseRoleType.Student;
};

// https://www.aalto.fi/en/aalto-university/schools-departments-and-units
export const departments: LocalizedString[] = [
  // School of Arts, Design and Architecture
  {
    fi: 'Arkkitehtuurin laitos',
    en: 'Department of Architecture',
    sv: 'Institutionen för arkitektur',
  },
  {
    fi: 'Taiteen ja median laitos',
    en: 'Department of Art and Media',
    sv: 'Institutionen för konst och media',
  },
  {
    fi: 'Muotoilun laitos',
    en: 'Department of Design',
    sv: 'Institutionen för design',
  },
  {
    fi: 'Elokuvataiteen laitos',
    en: 'Department of Film',
    sv: 'Institutionen för filmkonst',
  },

  // School of Business
  {
    fi: 'Laskentatoimen laitos',
    en: 'Department of Accounting and Business Law',
    sv: 'Institutionen för redovisning',
  },
  {
    fi: 'Taloustieteen laitos',
    en: 'Department of Economics',
    sv: 'Institutionen för ekonomi',
  },
  {
    fi: 'Rahoituksen laitos',
    en: 'Department of Finance',
    sv: 'Institutionen för finansiering',
  },
  {
    fi: 'Johtamisen laitos',
    en: 'Department of Management Studies',
    sv: 'Institutionen för ledarskapsstudier',
  },
  {
    fi: 'Markkinoinnin laitos',
    en: 'Department of Marketing',
    sv: 'Institutionen för marknadsföring',
  },
  {
    fi: 'Tieto- ja palvelujohtamisen laitos',
    en: 'Department of Information and Service Management',
    sv: 'Institutionen för informations- och serviceekonomi',
  },

  // School of Chemical Engineering
  {
    fi: 'Biotuotteiden ja biotekniikan laitos',
    en: 'Department of Bioproducts and Biosystems',
    sv: 'Institutionen för bioprodukter och bioteknik',
  },
  {
    fi: 'Kemian tekniikan ja metallurgian laitos',
    en: 'Department of Chemical and Metallurgical Engineering',
    sv: 'Institutionen för kemiteknik och metallurgi',
  },
  {
    fi: 'Kemian ja materiaalitieteen laitos',
    en: 'Department of Chemistry and Materials Science',
    sv: 'Institutionen för kemi och materialvetenskap',
  },

  // School of Electrical Engineering
  {
    fi: 'Informaatio- ja tietoliikennetekniikan laitos',
    en: 'Department of Information and Communications Engineering',
    sv: 'Institutionen för informations- och kommunikationsteknik',
  },
  {
    fi: 'Elektroniikan ja nanotekniikan laitos',
    en: 'Department of Electronics and Nanoengineering',
    sv: 'Institutionen för elektronik och nanoteknik',
  },
  {
    fi: 'Sähkötekniikan ja automaation laitos',
    en: 'Department of Electical Engineering and Automation',
    sv: 'Institutionen för elektroteknik och automation',
  },

  // School of Engineering
  {
    fi: 'Rakennetun ympäristön laitos',
    en: 'Department of Built Environment',
    sv: 'Institutionen för byggd miljö',
  },
  {
    fi: 'Rakennustekniikan laitos',
    en: 'Department of Civil Engineering',
    sv: 'Institutionen för byggnadsteknik',
  },
  {
    fi: 'Konetekniikan laitos',
    en: 'Department of Mechanical Engineering',
    sv: 'Institutionen för maskinteknik',
  },

  // School of Science
  {
    fi: 'Teknillisen fysiikan laitos',
    en: 'Department of Applied Physics',
    sv: 'Institutionen för teknisk fysik',
  },
  {
    fi: 'Tietotekniikan laitos',
    en: 'Department of Computer Science',
    sv: 'Institutionen för datateknik',
  },
  {
    fi: 'Tuotantotalouden laitos',
    en: 'Department of Industrial Engineering and Management',
    sv: 'Institutionen för produktionsekonomi',
  },
  {
    fi: 'Matematiikan ja systeemianalyysin laitos',
    en: 'Department of Mathematics and Systems Analysis',
    sv: 'Institutionen för matematik och systemanalys',
  },
  {
    fi: 'Neurotieteen ja lääketieteellisen tekniikan laitos',
    en: 'Department of Neuroscience and Biomedical Engineering',
    sv: 'Institutionen för neurovetenskap och biomedicinsk teknik',
  },
];

/** Available completion languages used in Sisu. */
export const sisuLanguageOptions: LanguageOption[] = [
  {
    id: Language.Finnish,
    language: 'Finnish',
  },
  {
    id: Language.Swedish,
    language: 'Swedish',
  },
  {
    id: Language.English,
    language: 'English',
  },
  {
    id: Language.Spanish,
    language: 'Spanish',
  },
  {
    id: Language.Japanese,
    language: 'Japanese',
  },
  {
    id: Language.Chinese,
    language: 'Chinese',
  },
  {
    id: Language.Portuguese,
    language: 'Portuguese',
  },
  {
    id: Language.French,
    language: 'French',
  },
  {
    id: Language.German,
    language: 'German',
  },
  {
    id: Language.Russian,
    language: 'Russian',
  },
];

export const setAplusToken = (token: string): void =>
  localStorage.setItem('Aplus-Token', token);

export const getAplusToken = (): string | null =>
  localStorage.getItem('Aplus-Token');

export const newAplusGradeSource = (
  aplusCourse: AplusCourseData,
  {
    module,
    exercise,
    difficulty,
  }: {
    module?: {
      id: number;
      name: string;
    };
    exercise?: {
      id: number;
      name: string;
    };
    difficulty?: string;
  }
): NewAplusGradeSourceData => {
  const base = {coursePartId: -1, aplusCourse: aplusCourse};

  if (module !== undefined) {
    return {
      ...base,
      sourceType: AplusGradeSourceType.Module,
      moduleId: module.id,
      moduleName: module.name,
    };
  }

  if (exercise !== undefined) {
    return {
      ...base,
      sourceType: AplusGradeSourceType.Exercise,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    };
  }

  if (difficulty !== undefined) {
    return {
      ...base,
      sourceType: AplusGradeSourceType.Difficulty,
      difficulty: difficulty,
    };
  }

  return {
    ...base,
    sourceType: AplusGradeSourceType.FullPoints,
  };
};
