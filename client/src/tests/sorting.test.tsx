// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {compareDate} from '../utils/sorting';

describe('Tests for sorting functions', () => {
  test('sortByDate should correcty arrange dates in a descending order', () => {
    const dates: Array<Date> = [
      new Date(2019, 8, 9),
      new Date(2021, 8, 14),
      new Date(2019, 11, 8),
      new Date(2020, 8, 8),
      new Date(2020, 11, 7),
      new Date(2021, 11, 13),
    ];

    const correctlyOrderedDates: Array<Date> = [
      new Date(2021, 11, 13),
      new Date(2021, 8, 14),
      new Date(2020, 11, 7),
      new Date(2020, 8, 8),
      new Date(2019, 11, 8),
      new Date(2019, 8, 9),
    ];

    dates.sort((a: Date, b: Date) => compareDate(a, b));

    expect(dates).toStrictEqual(correctlyOrderedDates);
  });
});
