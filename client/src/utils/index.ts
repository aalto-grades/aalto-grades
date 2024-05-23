// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseData,
  CourseRoleType,
  Language,
  LoginResult,
} from '@/common/types';
import {LanguageOption} from '../types';

type BaseType = {
  gradeId: number;
  grade: number;
  date: Date;
  expiryDate: Date;
};

export const gradeIsExpired = (grade: BaseType | null): boolean => {
  if (grade === null) return false;
  return new Date().getTime() > grade.expiryDate.getTime();
};

const gradeIsNewer = (
  newGrade: BaseType,
  oldGrade: BaseType | null
): boolean => {
  if (oldGrade === null) return true;
  const newDateTime = new Date(newGrade.date).getTime();
  const oldDateTime = new Date(oldGrade.date).getTime();
  if (newDateTime !== oldDateTime) return newDateTime > oldDateTime;
  return newGrade.gradeId > oldGrade.gradeId;
};

const gradeIsBetter = (
  newGrade: BaseType,
  oldGrade: BaseType | null
): boolean => {
  if (oldGrade === null) return true;
  if (newGrade.grade === oldGrade.grade)
    return gradeIsNewer(newGrade, oldGrade);
  return newGrade.grade > oldGrade.grade;
};

// The type is a template to be able to use with EditGradesDialog rows.

export type GradeSelectOption = 'best' | 'latest';
/**
 * Finds the best grade from a list of grades based on provided search options.
 *
 * @param {readonly T[]} grades An array of grades to search through.
 * @param {Object} [searchOptions] Options for customizing the search behavior.
 * @param {'any' | 'prefer_non_expired' | 'non_expired'} [searchOptions.expiredOption='any']
 *   Specifies how to handle expired grades. Default is `'any'`
 * @param {'best' | 'latest'} [searchOptions.gradeSelectOption='best'] -
 *   Specifies the criterion for selecting the best grade. Default is `'best'`
 * @returns {T | null} The best grade found based on the search options, or null
 *   if no suitable grade is found.
 */
export const findBestGrade = <T extends BaseType>(
  grades: readonly T[],
  searchOptions: {
    expiredOption?: 'any' | 'prefer_non_expired' | 'non_expired';
    gradeSelectOption?: GradeSelectOption;
  } = {
    expiredOption: 'any',
    gradeSelectOption: 'best',
  }
): T | null => {
  let bestSoFar: T | null = null;
  let bestSoFarExpired: T | null = null;
  const isBetter =
    searchOptions.gradeSelectOption === 'latest' ? gradeIsNewer : gradeIsBetter;
  for (const grade of grades) {
    if (searchOptions.expiredOption !== 'any' && gradeIsExpired(grade)) {
      if (isBetter(grade, bestSoFarExpired)) bestSoFarExpired = grade;
    } else {
      if (isBetter(grade, bestSoFar)) bestSoFar = grade;
    }
  }

  if (bestSoFar !== null) return bestSoFar;
  if (searchOptions.expiredOption === 'non_expired') return null;
  return bestSoFarExpired;
};

type BestFinalGradeData = {
  grade: number;
  date: Date;
  assessmentModelId: number | null;
};
/**
 * Finds the latest final grade from a list of final grades preferring manual
 * ones.
 */
export const findLatestFinalGrade = <T extends BestFinalGradeData>(
  finalGrades: readonly T[]
): T | null => {
  let bestSoFar: T | null = null;
  for (const finalGrade of finalGrades) {
    if (bestSoFar === null) {
      bestSoFar = finalGrade;
      continue;
    }

    const newIsManual = finalGrade.assessmentModelId === null;
    const oldIsManual = bestSoFar.assessmentModelId === null;
    // Prefer manual
    if (newIsManual && !oldIsManual) {
      bestSoFar = finalGrade;
      continue;
    } else if (oldIsManual && !newIsManual) {
      continue;
    }

    if (finalGrade.date >= bestSoFar.date) bestSoFar = finalGrade;
  }

  return bestSoFar;
};

export const getCourseRole = (
  course: CourseData,
  auth: LoginResult
): CourseRoleType => {
  const {teachersInCharge, assistants} = course;
  const isTeacher = teachersInCharge.find(teacher => teacher.id === auth.id);
  const isAssistant = assistants.find(assistant => assistant.id === auth.id);

  if (isTeacher !== undefined) return CourseRoleType.Teacher;
  if (isAssistant !== undefined) return CourseRoleType.Assistant;
  return CourseRoleType.Student;
};

// Available completion languages used in Sisu.
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
