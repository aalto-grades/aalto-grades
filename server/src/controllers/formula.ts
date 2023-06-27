// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import { Formula, FormulaData } from 'aalto-grades-common/types';
import { formulaImplementations } from '../formulas';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { FormulaImplementation } from '../types/formulas';

export function getFormulas(req: Request, res: Response): void {
  const formulas: Array<FormulaData> = [];

  for (const [key, value] of formulaImplementations) {
    formulas.push({
      id: key,
      name: value.name
    });
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formulas
    }
  });
}

export async function getFormula(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    formulaId: yup.string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(Formula))
      .required()
  });

  const formulaId: string = req.params.formulaId;
  await requestSchema.validate({ formulaId });
  const formula: FormulaImplementation | undefined =
  formulaImplementations.get(formulaId as Formula);

  if (!formula) {
    throw new ApiError(`formula with id ${formulaId} not found`, HttpCode.NotFound);
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formula: {
        id: formulaId,
        name: formula.name,
        attributes: formula.attributes,
        codeSnippet: formula.codeSnippet
      }
    }
  });
}
