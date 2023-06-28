// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import { Formula } from 'aalto-grades-common/types';
import { getAllFormulasBasicData, getFormulaImplementation } from '../formulas';
import { HttpCode } from '../types/httpCode';
import { FormulaImplementation } from '../types/formulas';

export async function getFormulas(req: Request, res: Response): Promise<void> {
  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formulas: await getAllFormulasBasicData()
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
  const formula: FormulaImplementation = await getFormulaImplementation(formulaId as Formula);

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
