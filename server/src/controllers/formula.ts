// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import { Formula, FormulaData } from 'aalto-grades-common/types';
import { getAllFormulasData, getFormulaImplementation } from '../formulas';
import { HttpCode } from '../types/httpCode';
import { FormulaImplementation } from '../types/formulas';

export async function getFormulas(req: Request, res: Response): Promise<void> {
  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formulas: getAllFormulasData()
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

  const formulaId: Formula = req.params.formulaId as Formula;
  await requestSchema.validate({ formulaId });
  const formulaImplementation: FormulaImplementation =
    getFormulaImplementation(formulaId);

  const formula: FormulaData = {
    id: formulaId,
    name: formulaImplementation.name,
    params: formulaImplementation.params,
    childParams: formulaImplementation.childParams,
    codeSnippet: formulaImplementation.codeSnippet
  };

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      formula
    }
  });
}
