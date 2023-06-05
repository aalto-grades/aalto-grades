// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import '@testing-library/jest-dom/extend-expect';
import sortingServices from '../services/sorting';

describe('Tests for sorting functions', () => {

  test('sortByDate should correcty arrange dates in a descending order', () => {

    const dates = [new Date(2019, 8, 9), new Date(2021, 8, 14), new Date(2019, 11, 8),
      new Date(2020, 8, 8), new Date(2020, 11, 7), new Date(2021, 11, 13)];
    const correctlyOrderedDates = [new Date(2021, 11, 13), new Date(2021, 8, 14), new Date(2020, 11, 7),
      new Date(2020, 8, 8), new Date(2019, 11, 8), new Date(2019, 8, 9)];

    dates.sort((a, b) => sortingServices.sortByDate(a, b));

    expect(dates).toStrictEqual(correctlyOrderedDates);
  });

  test('sortByCode should correcty arrange course codes in a descending order', () => {

    const codes = ['MS-A0102', 'TU-A1100', 'CS-A1110', 'PHYS-A1140', 'CS-A1150', 'CS-C2130'];
    const correctlyOrderedCodes = ['CS-A1110', 'CS-A1150', 'CS-C2130', 'MS-A0102', 'PHYS-A1140', 'TU-A1100'];

    codes.sort((a, b) => sortingServices.sortByCode(a, b));

    expect(codes).toStrictEqual(correctlyOrderedCodes);
  });

});
