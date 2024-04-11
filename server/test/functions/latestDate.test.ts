// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {getDateOfLatestGrade} from '../../src/controllers/utils/grades';

describe('Test latest date finder', () => {
  it('should return the correct date', async () => {
    expect(await getDateOfLatestGrade(11, 7)).toEqual(new Date('2022-02-02'));
    expect(await getDateOfLatestGrade(12, 7)).toEqual(new Date('2022-05-01'));
  });

  it('should throw an error when no grades exist', async () => {
    await expect(getDateOfLatestGrade(6, 1)).rejects.toThrow();
  });
});
