// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DateOnlyString, GradeOption} from '@common/types';

type Resolve = (value: void | PromiseLike<void>) => void;

export function sleep(ms: number = 2000): Promise<void> {
  return new Promise((resolve: Resolve) => setTimeout(resolve, ms));
}

export function getParamLabel(labelKey: string): string {
  const splitString: Array<string> = labelKey.split(/(?=[A-Z])/);
  const label: string = splitString.join(' ');
  const capitalizedLabel: string =
    label.charAt(0).toUpperCase() + label.slice(1);
  return capitalizedLabel;
}

export function findBestGradeOption(
  options: Array<GradeOption>,
  searchOptions: {avoidExpired: boolean; preferExpiredToNull: boolean} = {
    avoidExpired: false, // Will not count expired grades as best
    preferExpiredToNull: true, // Will return expired grades if no non-expired grades are found
  }
): GradeOption | null {
  let bestSoFar: GradeOption | null = null;
  let bestSoFarExpired: GradeOption | null = null;

  for (const option of options) {
    if (searchOptions.avoidExpired && isGradeDateExpired(option.expiryDate)) {
      if (!bestSoFarExpired || option.grade > bestSoFarExpired.grade)
        bestSoFarExpired = option;
    } else {
      if (!bestSoFar || option.grade > bestSoFar.grade) bestSoFar = option;
    }
  }
  return !bestSoFar && searchOptions.preferExpiredToNull
    ? bestSoFarExpired
    : bestSoFar;
}

/**
 * Determines whether a given grade date has expired.
 * @param date - The grade date to check.
 * @returns True if the grade date has expired, false otherwise.
 */
export function isGradeDateExpired(
  date: Date | DateOnlyString | undefined
): boolean {
  if (!date) return false;
  const now: Date = new Date();
  const gradeDate: Date = new Date(date);
  return now > gradeDate;
}
