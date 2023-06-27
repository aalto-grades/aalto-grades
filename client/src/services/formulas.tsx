// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import mockFormulas from '../mock-data/mockFormulas';
import { FormulaData, FormulaPreview } from 'aalto-grades-common/types';
import { AxiosResponse } from 'axios';

async function getFormulas(): Promise<Array<FormulaData>> {
  const response: AxiosResponse = await axios.get('/v1/formulas');
  return response.data.data.formulas;
}

async function getFormulaDetails(formulaId: string): Promise<FormulaPreview> {
  const response: AxiosResponse = await axios.get(`/v1/formulas/${formulaId}`);
  return response.data.data.formula;
}

async function setFormula(formulaInfo): Promise<any> {
  // TODO: specify route
  const response: AxiosResponse = await axios.post('/??', formulaInfo);
  console.log(response.data);
  return response.data;
}

// A temporary function to get a mock formula's name
function getFormulaName(formulaId): any {
  const formula = mockFormulas.find(formula => formula.id === formulaId);
  const formulaName = formula ? formula.name : 'None';
  return formulaName;
}

// A temporary function to get a mock formula's attributes
function getFormulaAttributes(formulaId): any {
  const formula = mockFormulas.find(formula => formula.id === formulaId);
  const formulaAttributes = formula ? formula.attributes : '';
  return formulaAttributes;
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
  getFormulas, getFormulaDetails, setFormula,
  getFormulaName, getFormulaAttributes, getAttributeLabel
};
