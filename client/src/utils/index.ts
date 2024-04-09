// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradeOption, Language} from '@common/types';
import {LanguageOption} from '../types';

/**
 * Determines whether a given grade date has expired.
 * @param date - The grade date to check.
 * @returns True if the grade date has expired, false otherwise.
 */
export const isGradeDateExpired = (date: Date | undefined): boolean => {
  if (!date) return false;
  return new Date().getTime() > new Date(date).getTime();
};
const gradeIsNewer = (
  newGrade: GradeOption,
  oldGrade: GradeOption | null
): boolean => {
  if (oldGrade === null) return true;
  if (newGrade.date === undefined) return false;
  if (oldGrade.date === undefined) return true;
  const newDate = new Date(newGrade.date).getTime();
  const oldDate = new Date(oldGrade.date).getTime();
  if (newDate !== oldDate) return newDate > oldDate;
  return (newGrade.gradeId as number) > (oldGrade.gradeId as number);
};
const gradeIsBetter = (
  newGrade: GradeOption,
  oldGrade: GradeOption | null
): boolean => {
  if (oldGrade === null) return true;
  if (newGrade.grade === oldGrade.grade)
    return gradeIsNewer(newGrade, oldGrade);
  return newGrade.grade > oldGrade.grade;
};
export const findBestGradeOption = (
  options: Array<GradeOption>,
  searchOptions: {
    avoidExpired: boolean;
    preferExpiredToNull: boolean;
    useLatest: boolean;
  } = {
    avoidExpired: false, // Will not count expired grades as best
    preferExpiredToNull: true, // Will return expired grades if no non-expired grades are found
    useLatest: false, // Will return latest grade instead of the highest one
  }
): GradeOption | null => {
  let bestSoFar: GradeOption | null = null;
  let bestSoFarExpired: GradeOption | null = null;
  const compare = searchOptions.useLatest ? gradeIsNewer : gradeIsBetter;

  for (const option of options) {
    if (searchOptions.avoidExpired && isGradeDateExpired(option.expiryDate)) {
      if (compare(option, bestSoFarExpired)) bestSoFarExpired = option;
    } else {
      if (compare(option, bestSoFar)) bestSoFar = option;
    }
  }
  return !bestSoFar && searchOptions.preferExpiredToNull
    ? bestSoFarExpired
    : bestSoFar;
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
