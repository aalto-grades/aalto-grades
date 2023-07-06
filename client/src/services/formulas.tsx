// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AxiosResponse } from 'axios';
import axios from './axios';
import { Formula, FormulaData, FormulaPreview } from 'aalto-grades-common/types';

async function getFormulas(): Promise<Array<FormulaData>> {
  const response: AxiosResponse = await axios.get('/v1/formulas');
  return response.data.data.formulas;
}

async function getFormulaDetails(formulaId: Formula): Promise<FormulaPreview> {
  const response: AxiosResponse = await axios.get(`/v1/formulas/${formulaId}`);
  return response.data.data.formula;
}

async function setFormula(formulaInfo: unknown): Promise<unknown> {
  // TODO: specify route
  const response: AxiosResponse = await axios.post('/??', formulaInfo);
  console.log(response.data);
  return response.data;
}

// A function for getting the displayable label from a label key
// for example: the label key maxPoints would return Max Points
function getAttributeLabel(labelKey: string): string {
  const splitString: Array<string> = labelKey.split(/(?=[A-Z])/);
  const label: string = splitString.join(' ');
  const capitalizedLabel: string = label.charAt(0).toUpperCase() + label.slice(1);
  return capitalizedLabel;
}

export default {
  getFormulas, getFormulaDetails,
  setFormula, getAttributeLabel
};
