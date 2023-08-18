// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { getDateOfLatestGrade } from '../../src/controllers/utils/grades';

describe('Test latest date finder', () => {

  it('should return the correct date', async () => {
    expect(await getDateOfLatestGrade(391, 49)).toEqual(new Date('2022-07-01'));
    expect(await getDateOfLatestGrade(1, 8)).toEqual(new Date('2023-01-01'));
  });

  it('should not return a timestamp', async () => {
    expect(
      (await getDateOfLatestGrade(391, 49)).toISOString().split('T')[1]
    ).toEqual('00:00:00.000Z');
    expect(
      (await getDateOfLatestGrade(1, 8)).toISOString().split('T')[1]
    ).toEqual('00:00:00.000Z');
  });

  it('should throw an error when no grades exist', async () => {
    await expect(getDateOfLatestGrade(500, 1)).rejects.toThrow();
  });
});
