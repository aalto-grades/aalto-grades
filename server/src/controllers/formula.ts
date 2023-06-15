// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import { formulas } from '../formulas/codeSnippets';
import { ApiError } from '../types/error';
import { Formula, FormulaPreview } from '../types/formulas';
import { HttpCode } from '../types/httpCode';

export function getFormulas(req: Request, res: Response): void {
  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formulas: formulas.map((formula: FormulaPreview) => {
        return {
          id: formula.id,
          name: formula.name
        };
      })
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
      .notRequired()
  });

  const formulaId: string = req.params.formulaId;
  await requestSchema.validate({ formulaId });

  const formula: Array<FormulaPreview> = formulas.filter(
    (formula: FormulaPreview) => formulaId === formula.id
  );

  if (formula.length === 0) {
    throw new ApiError(`formula with id ${formulaId} not found`, HttpCode.NotFound);
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formula: formula[0]
    }
  });
}
