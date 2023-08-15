// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DateOnlyString } from 'aalto-grades-common/types';

export function toDateOnlyString(date: Date | string): DateOnlyString {
  const dateOnlyRegExp: RegExp =
    /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;

  function validate(dateString: string): DateOnlyString {
    if (dateOnlyRegExp.test(dateString)) {
      return dateString as DateOnlyString;
    } else {
      throw new Error(`invalid date only string ${dateString}`);
    }
  }

  if (date instanceof Date)
    return validate(date.toISOString().split('T')[0]);

  return toDateOnlyString(new Date(date));
}
