// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Formula} from 'aalto-grades-common/types';

import {getFormulaImplementation} from '../../src/formulas';
import {FormulaImplementation} from '../../src/types';

describe('Test Rise Bonus Formula calculation', () => {
  const implementation: FormulaImplementation = getFormulaImplementation(
    Formula.RiseBonus
  );

  it('should accept parameters of the appropriate form', async () => {
    await implementation.paramSchema.validate({
      children: [
        ['1', {gradingType: 'BASE'}],
        ['2', {gradingType: 'BONUS'}],
      ],
    });
  });
});
