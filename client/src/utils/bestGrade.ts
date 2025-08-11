// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {CoursePartData, CourseTaskData} from '@/common/types';

type BaseType = {
  id: number;
  grade: number;
  date: Date;
  expiryDate: Date | null;
};

const isDateExpired = (date: Date | null | undefined): boolean => {
  if (!date) return false;
  return Date.now() > date.getTime();
};

export const gradeIsExpired = (
  grade: BaseType | null,
  coursePartExpiryDate?: Date | null
): boolean => {
  if (
    grade?.expiryDate
    && !isDateExpired(grade.expiryDate)
    && isDateExpired(coursePartExpiryDate)
  ) {
    return false;
  }

  return (
    isDateExpired(grade?.expiryDate) || isDateExpired(coursePartExpiryDate)
  );
};

const gradeIsNewer = (
  newGrade: BaseType | BestFinalGradeData,
  oldGrade: BaseType | BestFinalGradeData | null
): boolean => {
  if (oldGrade === null) return true;
  const newDateTime = newGrade.date.getTime();
  const oldDateTime = oldGrade.date.getTime();
  if (newDateTime !== oldDateTime) return newDateTime > oldDateTime;
  return newGrade.id > oldGrade.id;
};

const gradeIsBetter = (
  newGrade: BaseType | BestFinalGradeData,
  oldGrade: BaseType | BestFinalGradeData | null
): boolean => {
  if (oldGrade === null) return true;
  if (newGrade.grade === oldGrade.grade)
    return gradeIsNewer(newGrade, oldGrade);
  return newGrade.grade > oldGrade.grade;
};

// The type is a template to be able to use with EditGradesDialog rows.

// TODO: Remove option latest? (#889)
export type GradeSelectOption = 'best' | 'latest';
/**
 * Finds the best grade from a list of grades based on provided search options.
 *
 * @param {readonly T[]} grades An array of grades to search through.
 * @param {Object} [searchOptions] Options for customizing the search behavior.
 * @param {'any' | 'prefer_non_expired' | 'non_expired'} [searchOptions.expiredOption='non_expired']
 *   Specifies how to handle expired grades. Default is `'non_expired'`
 * @param {'best' | 'latest'} [searchOptions.gradeSelectOption='best'] -
 *   Specifies the criterion for selecting the best grade. Default is `'best'`
 * @returns {T | null} The best grade found based on the search options, or null
 *   if no suitable grade is found.
 */
export const findBestGrade = <T extends BaseType>(
  grades: readonly T[],
  coursePartExpiryDate?: Date | null,
  searchOptions: {
    expiredOption?: 'any' | 'prefer_non_expired' | 'non_expired';
    gradeSelectOption?: GradeSelectOption;
  } = {
    expiredOption: 'non_expired',
    gradeSelectOption: 'best',
  }
): T | null => {
  let bestSoFar: T | null = null;
  let bestSoFarExpired: T | null = null;
  const isBetter =
    searchOptions.gradeSelectOption === 'latest' ? gradeIsNewer : gradeIsBetter;
  for (const grade of grades) {
    if (
      searchOptions.expiredOption !== 'any'
      && gradeIsExpired(grade, coursePartExpiryDate)
    ) {
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
  id: number;
  grade: number;
  date: Date;
  gradingModelId: number | null;
};
/**
 * Finds the best final grade from a list of final grades preferring manual
 * ones.
 */
export const findBestFinalGrade = <T extends BestFinalGradeData>(
  finalGrades: readonly T[],
  searchOptions: {
    gradeSelectOption?: GradeSelectOption;
  } = {
    gradeSelectOption: 'latest',
  }
): T | null => {
  let bestSoFar: T | null = null;
  for (const finalGrade of finalGrades) {
    if (bestSoFar === null) {
      bestSoFar = finalGrade;
      continue;
    }

    const newIsManual = finalGrade.gradingModelId === null;
    const oldIsManual = bestSoFar.gradingModelId === null;
    // Prefer manual
    if (newIsManual && !oldIsManual) {
      bestSoFar = finalGrade;
      continue;
    } else if (oldIsManual && !newIsManual) {
      continue;
    }
    const isBetter =
      searchOptions.gradeSelectOption === 'latest'
        ? gradeIsNewer
        : gradeIsBetter;

    bestSoFar = isBetter(finalGrade, bestSoFar) ? finalGrade : bestSoFar;
  }

  return bestSoFar;
};

export const getCoursePartExpiryDate = (
  courseParts?: CoursePartData[],
  courseTasks?: CourseTaskData[],
  courseTaskId?: number
): Date | null | undefined => {
  const coursePart = courseParts?.find(
    part =>
      part.id
      === courseTasks?.find(taskData => taskData.id === courseTaskId)?.coursePartId
  );
  return coursePart?.expiryDate;
};
