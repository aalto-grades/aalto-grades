// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DateOnlyString} from 'aalto-grades-common/types';

/**
 * Converts a Date object or a string to a date-only string format (YYYY-MM-DD).
 * Throws an error if the input date is undefined, null, or an invalid date string.
 * @param date - The Date object or string to be converted.
 * @returns The date-only string representation of the input date.
 * @throws Error if the input date is undefined, null, or an invalid date string.
 */
export function toDateOnlyString(date: Date | string) {
  if (!date) {
    throw new Error(`date is undefined or null: ${date}`);
  }
  const dateOnlyRegExp: RegExp =
    /^\d{4}[/-](0?[1-9]|1[012])[/-](0?[1-9]|[12][0-9]|3[01])$/;

  function validate(dateString: string) {
    if (dateOnlyRegExp.test(dateString)) {
      return dateString as DateOnlyString;
    } else {
      throw new Error(`invalid date only string ${dateString}`);
    }
  }

  if (date instanceof Date) return validate(date.toISOString().split('T')[0]);
  else {
    return validate(new Date(date).toISOString().split('T')[0]);
  }
}
