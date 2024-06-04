// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

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
  gradingModelId: number | null;
};
/**
 * Finds the best final grade from a list of final grades preferring manual
 * ones.
 */
export const findBestFinalGrade = <T extends BestFinalGradeData>(
  finalGrades: readonly T[]
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

    if (finalGrade.grade > bestSoFar.grade) bestSoFar = finalGrade;
    else if (
      finalGrade.grade === bestSoFar.grade &&
      finalGrade.date >= bestSoFar.date
    )
      bestSoFar = finalGrade;
  }

  return bestSoFar;
};
