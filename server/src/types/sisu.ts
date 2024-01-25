// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {LocalizedString} from '@common/types';

export interface Organizations {
  organisationId: string;
  educationalInstitutionUrn: string | null;
  roleUrn: string;
  share: number;
  validityPeriod: object;
}

export interface StudySubGroup {
  id: string;
  name: LocalizedString;
  type: LocalizedString;
}

export interface CourseUnit {
  courseUnitGroupId: string;
  credits: number | string | null;
}

export interface SisuCourseInstance {
  id: string;
  code: string;
  startDate: Date;
  endDate: Date;
  type: string;
  name: LocalizedString;
  summary: {
    workload: LocalizedString;
    prerequisites: LocalizedString;
    learningOutcomes: LocalizedString;
    literature: LocalizedString;
    languageOfInstruction: LocalizedString;
    registration: LocalizedString;
    homepage: object;
    content: LocalizedString;
    cefrLevel: string;
    level: LocalizedString;
    teacherInCharge: Array<string>;
    assesmentMethods: LocalizedString;
    substitutes: {
      fi: LocalizedString['fi'];
      sv: LocalizedString['sv'];
      en: LocalizedString['en'];
      courseUnits: Array<Array<CourseUnit>>;
    };
    additionalInformation: LocalizedString;
    gradingScale: LocalizedString;
    teachingPeriod: LocalizedString;
  };
  organizations: Array<Organizations>;
  organizationId: string;
  organizationName: LocalizedString;
  credits: {
    min: number;
    max: number;
  };
  courseUnitId: string;
  languageOfInstructionCodes: Array<string>;
  teachers: Array<string>;
  enrolmentStartDate: string;
  enrolmentEndDate: string;
  mincredits: string;
  studySubGroups: Array<StudySubGroup>;
}

export interface SisuError {
  error: {
    code: number;
    message: string;
  };
}
