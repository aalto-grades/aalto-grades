// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, FormulaData } from 'aalto-grades-common/types';

import axios from './axios';
import { FullResponse } from '../types';

async function getFormulas(): Promise<Array<FormulaData>> {
  const response: FullResponse<{ formulas: Array<FormulaData> }> =
    await axios.get('/v1/formulas');

  return response.data.data.formulas;
}

async function getFormulaDetails(formulaId: Formula): Promise<FormulaData> {
  const response: FullResponse<{ formula: FormulaData }> =
    await axios.get(`/v1/formulas/${formulaId}`);

  return response.data.data.formula;
}

// A function for getting the displayable label from a label key
// for example: the label key maxPoints would return Max Points
function getParamLabel(labelKey: string): string {
  const splitString: Array<string> = labelKey.split(/(?=[A-Z])/);
  const label: string = splitString.join(' ');
  const capitalizedLabel: string = label.charAt(0).toUpperCase() + label.slice(1);
  return capitalizedLabel;
}

export default {
  getFormulas, getFormulaDetails, getParamLabel
};
