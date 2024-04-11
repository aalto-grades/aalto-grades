// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {gradeIsExpired} from '../../src/controllers/utils/grades';

// TODO: Test if some expired and some not (for same attainment and user)
describe('Test grade expiry', () => {
  it(
    "should correctly determine whether a grade has expired based on the grade's" +
      ' expiry date, if one is defined for the grade',
    async () => {
      // Comparison date is 2023-05-10
      expect(await gradeIsExpired(37)).toBeTruthy(); // Expiry date: 2023-12-31
      expect(await gradeIsExpired(38)).toBeTruthy(); // Expiry date: 2023-01-01
      expect(await gradeIsExpired(39)).toBeFalsy(); // Expiry date: 2100-12-31
      expect(await gradeIsExpired(40)).toBeFalsy(); // Expiry date: 2100-01-01
    }
  );

  it('should throw an error if the given grade ID does not exist', async () => {
    await expect(gradeIsExpired(99999999999)).rejects.toThrow();
  });
});
