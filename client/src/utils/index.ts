// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Language} from '@common/types';
import {LanguageOption} from '../types';

type BaseType = {
  gradeId?: number | undefined;
  grade: number;
  date?: Date;
  expiryDate?: Date;
};

export const gradeIsExpired = (grade: BaseType | null): boolean => {
  if (grade === null || grade.expiryDate === undefined) return false;
  return new Date().getTime() > grade.expiryDate.getTime();
};

const gradeIsNewer = (
  newGrade: BaseType,
  oldGrade: BaseType | null
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
  newGrade: BaseType,
  oldGrade: BaseType | null
): boolean => {
  if (oldGrade === null) return true;
  if (newGrade.grade === oldGrade.grade)
    return gradeIsNewer(newGrade, oldGrade);
  return newGrade.grade > oldGrade.grade;
};

// The type is a template to be able to use with EditGradesDialog rows.
export const findBestGrade = <T extends BaseType>(
  grades: readonly T[],
  searchOptions: {
    avoidExpired: boolean;
    preferExpiredToNull: boolean;
    useLatest: boolean;
  } = {
    avoidExpired: false, // Will not count expired grades as best
    preferExpiredToNull: true, // Will return expired grades if no non-expired grades are found
    useLatest: false, // Will return latest grade instead of the highest one
  }
): T | null => {
  let bestSoFar: T | null = null;
  let bestSoFarExpired: T | null = null;
  const isBetter = searchOptions.useLatest ? gradeIsNewer : gradeIsBetter;
  for (const grade of grades) {
    if (searchOptions.avoidExpired && gradeIsExpired(grade)) {
      if (isBetter(grade, bestSoFarExpired)) bestSoFarExpired = grade;
    } else {
      if (isBetter(grade, bestSoFar)) bestSoFar = grade;
    }
  }
  return bestSoFar === null && searchOptions.preferExpiredToNull
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
