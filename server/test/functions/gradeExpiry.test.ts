// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { gradeIsExpired } from '../../src/controllers/utils/grades';

describe('Test grade expiry', () => {

  it(
    'should correctly determine whether a grade has expired based on the grade\'s'
    + ' expiry date, if one is defined for the grade',
    async () => {
      // TODO
    }
  );

  it(
    'should correctly determine whether a grade has expired based on the'
    + ' attainment\'s daysValid value, if no expiry date is defined for the grade',
    async () => {
      // TODO
    }
  );

  it('should throw an error if the given grade ID does not exist', async () => {
    // TODO
  });
});
