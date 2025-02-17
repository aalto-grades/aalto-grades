// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type AuthData,
  type CourseData,
  CourseRoleType,
  Department,
  GradingScale,
  Language,
} from '@/common/types';
import type {DepartmentOption, LanguageOption} from '@/types';

export type Token = 'a+' | 'sisu';

export const setToken = (type: Token, token: string): void =>
  localStorage.setItem(type, token);

export const getToken = (type: Token): string | null =>
  localStorage.getItem(type);

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
export const departments: DepartmentOption[] = [
  // School of Arts, Design and Architecture
  {
    id: Department.Architecture,
    department: {
      fi: 'Arkkitehtuurin laitos',
      en: 'Department of Architecture',
      sv: 'Institutionen för arkitektur',
    },
  },
  {
    id: Department.ArtAndMedia,
    department: {
      fi: 'Taiteen ja median laitos',
      en: 'Department of Art and Media',
      sv: 'Institutionen för konst och media',
    },
  },
  {
    id: Department.Design,
    department: {
      fi: 'Muotoilun laitos',
      en: 'Department of Design',
      sv: 'Institutionen för design',
    },
  },
  {
    id: Department.Film,
    department: {
      fi: 'Elokuvataiteen laitos',
      en: 'Department of Film',
      sv: 'Institutionen för filmkonst',
    },
  },

  // School of Business
  {
    id: Department.AccountingAndBusinessLaw,
    department: {
      fi: 'Laskentatoimen laitos',
      en: 'Department of Accounting and Business Law',
      sv: 'Institutionen för redovisning',
    },
  },
  {
    id: Department.Economics,
    department: {
      fi: 'Taloustieteen laitos',
      en: 'Department of Economics',
      sv: 'Institutionen för ekonomi',
    },
  },
  {
    id: Department.Finance,
    department: {
      fi: 'Rahoituksen laitos',
      en: 'Department of Finance',
      sv: 'Institutionen för finansiering',
    },
  },
  {
    id: Department.ManagementStudies,
    department: {
      fi: 'Johtamisen laitos',
      en: 'Department of Management Studies',
      sv: 'Institutionen för ledarskapsstudier',
    },
  },
  {
    id: Department.Marketing,
    department: {
      fi: 'Markkinoinnin laitos',
      en: 'Department of Marketing',
      sv: 'Institutionen för marknadsföring',
    },
  },
  {
    id: Department.InformationAndServiceManagement,
    department: {
      fi: 'Tieto- ja palvelujohtamisen laitos',
      en: 'Department of Information and Service Management',
      sv: 'Institutionen för informations- och serviceekonomi',
    },
  },

  // School of Chemical Engineering
  {
    id: Department.BioproductsAndBiosystems,
    department: {
      fi: 'Biotuotteiden ja biotekniikan laitos',
      en: 'Department of Bioproducts and Biosystems',
      sv: 'Institutionen för bioprodukter och bioteknik',
    },
  },
  {
    id: Department.ChemicalAndMetallurgicalEngineering,
    department: {
      fi: 'Kemian tekniikan ja metallurgian laitos',
      en: 'Department of Chemical and Metallurgical Engineering',
      sv: 'Institutionen för kemiteknik och metallurgi',
    },
  },
  {
    id: Department.ChemistryAndMaterialsScience,
    department: {
      fi: 'Kemian ja materiaalitieteen laitos',
      en: 'Department of Chemistry and Materials Science',
      sv: 'Institutionen för kemi och materialvetenskap',
    },
  },

  // School of Electrical Engineering
  {
    id: Department.InformationAndCommunicationsEngineering,
    department: {
      fi: 'Informaatio- ja tietoliikennetekniikan laitos',
      en: 'Department of Information and Communications Engineering',
      sv: 'Institutionen för informations- och kommunikationsteknik',
    },
  },
  {
    id: Department.ElectronicsAndNanoengineering,
    department: {
      fi: 'Elektroniikan ja nanotekniikan laitos',
      en: 'Department of Electronics and Nanoengineering',
      sv: 'Institutionen för elektronik och nanoteknik',
    },
  },
  {
    id: Department.ElectricalEngineeringAndAutomation,
    department: {
      fi: 'Sähkötekniikan ja automaation laitos',
      en: 'Department of Electrical Engineering and Automation',
      sv: 'Institutionen för elektroteknik och automation',
    },
  },

  // School of Engineering
  {
    id: Department.BuiltEnvironment,
    department: {
      fi: 'Rakennetun ympäristön laitos',
      en: 'Department of Built Environment',
      sv: 'Institutionen för byggd miljö',
    },
  },
  {
    id: Department.CivilEngineering,
    department: {
      fi: 'Rakennustekniikan laitos',
      en: 'Department of Civil Engineering',
      sv: 'Institutionen för byggnadsteknik',
    },
  },
  {
    id: Department.MechanicalEngineering,
    department: {
      fi: 'Konetekniikan laitos',
      en: 'Department of Mechanical Engineering',
      sv: 'Institutionen för maskinteknik',
    },
  },

  // School of Science
  {
    id: Department.AppliedPhysics,
    department: {
      fi: 'Teknillisen fysiikan laitos',
      en: 'Department of Applied Physics',
      sv: 'Institutionen för teknisk fysik',
    },
  },
  {
    id: Department.ComputerScience,
    department: {
      fi: 'Tietotekniikan laitos',
      en: 'Department of Computer Science',
      sv: 'Institutionen för datateknik',
    },
  },
  {
    id: Department.IndustrialEngineeringAndManagement,
    department: {
      fi: 'Tuotantotalouden laitos',
      en: 'Department of Industrial Engineering and Management',
      sv: 'Institutionen för produktionsekonomi',
    },
  },
  {
    id: Department.MathematicsAndSystemsAnalysis,
    department: {
      fi: 'Matematiikan ja systeemianalyysin laitos',
      en: 'Department of Mathematics and Systems Analysis',
      sv: 'Institutionen för matematik och systemanalys',
    },
  },
  {
    id: Department.NeuroscienceAndBiomedicalEngineering,
    department: {
      fi: 'Neurotieteen ja lääketieteellisen tekniikan laitos',
      en: 'Department of Neuroscience and Biomedical Engineering',
      sv: 'Institutionen för neurovetenskap och biomedicinsk teknik',
    },
  },

  // Other
  {
    id: Department.LanguageCentre,
    department: {
      fi: 'Aalto University, Kielikeskus',
      en: 'Aalto University, Language Centre',
      sv: 'Språkcentret',
    },
  },
];

/** Available completion languages used in Sisu. */
export const sisuLanguageOptions: LanguageOption[] = [
  {
    id: Language.Finnish,
    language: {fi: 'Suomi', en: 'Finnish', sv: 'Finska'},
  },
  {
    id: Language.Swedish,
    language: {fi: 'Ruotsi', en: 'Swedish', sv: 'Svenska'},
  },
  {
    id: Language.English,
    language: {fi: 'Englanti', en: 'English', sv: 'Engelska'},
  },
  {
    id: Language.Spanish,
    language: {fi: 'Espanja', en: 'Spanish', sv: 'Spanska'},
  },
  {
    id: Language.Japanese,
    language: {fi: 'Japani', en: 'Japanese', sv: 'Japanska'},
  },
  {
    id: Language.Chinese,
    language: {fi: 'Kiina', en: 'Chinese', sv: 'Kinesiska'},
  },
  {
    id: Language.Portuguese,
    language: {fi: 'Portugali', en: 'Portuguese', sv: 'Portugisiska'},
  },
  {
    id: Language.French,
    language: {fi: 'Ranska', en: 'French', sv: 'Franska'},
  },
  {
    id: Language.German,
    language: {fi: 'Saksa', en: 'German', sv: 'Tyska'},
  },
  {
    id: Language.Russian,
    language: {fi: 'Venäjä', en: 'Russian', sv: 'Ryska'},
  },
];
