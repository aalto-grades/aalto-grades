// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AuthData,
  CourseData,
  CourseRoleType,
  GradingScale,
  Language,
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
