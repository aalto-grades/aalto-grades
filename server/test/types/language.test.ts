// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ZodError, z} from 'zod';
import {localizedStringSchema} from '../../src/types';

describe('Test localizedStringSchema', () => {
  function runValidation(input: object): void {
    const schema = z.object({
      name: localizedStringSchema,
      department: localizedStringSchema,
    });
    schema.parse(input);
  }

  it('should resolve with correct input', () => {
    expect(
      runValidation({
        name: {
          fi: 'Differentiaali- ja intergraalilaskenta 1',
          en: 'Differential and Integral Calculus 1',
          sv: 'Differential- och integralkalkyl 1',
        },
        department: {
          fi: 'Matematiikan ja systeemianalyysin laitos',
          en: 'Department of Mathematics and Systems Analysis',
          sv: 'Institutionen för matematik och systemanalys',
        },
      })
    ).resolves;

    expect(
      runValidation({
        name: {
          fi: 'Differentiaali- ja intergraalilaskenta 1',
          sv: 'Differential- och integralkalkyl 1',
        },
        department: {
          fi: 'Matematiikan ja systeemianalyysin laitos',
          en: 'Department of Mathematics and Systems Analysis',
        },
      })
    ).resolves;
  });

  it('should resolve, if a non-required localized string is undefined', () => {
    expect(
      runValidation({
        name: {
          fi: 'Differentiaali- ja intergraalilaskenta 1',
          en: 'Differential and Integral Calculus 1',
          sv: 'Differential- och integralkalkyl 1',
        },
      })
    ).resolves;
  });

  it('should reject and throw ValidationError, if a required localized string is undefined', async () => {
    await expect(
      runValidation({
        department: {
          fi: 'Matematiikan ja systeemianalyysin laitos',
          en: 'Department of Mathematics and Systems Analysis',
          sv: 'Institutionen för matematik och systemanalys',
        },
      })
    ).rejects.toThrow(ZodError);
  });

  it('should reject and throw ValidationError, if the object for a localized string is empty', async () => {
    await expect(
      runValidation({
        name: {
          fi: 'Differentiaali- ja intergraalilaskenta 1',
          en: 'Differential and Integral Calculus 1',
          sv: 'Differential- och integralkalkyl 1',
        },
        department: {},
      })
    ).rejects.toThrow(ZodError);
  });

  it(
    'should reject and throw ValidationError, if unknown translations are ' +
      'present in a localized string',
    async () => {
      await expect(
        runValidation({
          name: {
            test: 'not valid',
          },
          department: {
            fi: 'Sähkötekniikan korkeakoulu',
            test: 'not valid',
          },
        })
      ).rejects.toThrow(ZodError);
    }
  );
});
