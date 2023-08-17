// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { gradeIsExpired } from '../../src/controllers/utils/grades';

describe('Test grade expiry', () => {

  it(
    'should correctly determine whether a grade has expired based on the grade\'s'
    + ' expiry date, if one is defined for the grade',
    async () => {
      // Comparison date is 2023-05-10
      expect(await gradeIsExpired(154)).toBeFalsy(); // Expiry date: 2024-04-23
      expect(await gradeIsExpired(155)).toBeFalsy(); // Expiry date: 2023-05-11
      expect(await gradeIsExpired(156)).toBeTruthy(); // Expiry date: 2023-05-10
      expect(await gradeIsExpired(157)).toBeTruthy(); // Expiry date: 2023-05-09
      expect(await gradeIsExpired(158)).toBeTruthy(); // Expiry date: 2022-04-23
    }
  );

  it(
    'should correctly determine whether a grade has expired based on the'
    + ' attainment\'s daysValid value, if no expiry date is defined for the grade',
    async () => {
      // Comparison date is 2023-05-10, days valid is 5
      expect(await gradeIsExpired(159)).toBeFalsy(); // Date: 2023-05-10
      expect(await gradeIsExpired(160)).toBeFalsy(); // Date: 2023-05-09
      expect(await gradeIsExpired(161)).toBeFalsy(); // Date: 2023-05-06
      expect(await gradeIsExpired(162)).toBeTruthy(); // Date: 2023-05-05
      expect(await gradeIsExpired(163)).toBeTruthy(); // Date: 2023-05-01
    }
  );

  it('should throw an error if the given grade ID does not exist', async () => {
    await expect(gradeIsExpired(99999999999)).rejects.toThrow();
  });
});
