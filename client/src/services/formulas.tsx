// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import mockFormulas from '../mock-data/mockFormulas';

async function getFormulas(): Promise<any> {
  const response = await axios.get('/v1/formulas');
  return response.data.data.formulas;
}

async function getFormulaDetails(formulaId: string): Promise<any> {
  const response = await axios.get(`/v1/formulas/${formulaId}`);
  return response.data.data.formula;
}

const setFormula: any = async (formulaInfo) => {
  // TODO: specify route
  const response = await axios.post('/??', formulaInfo);
  console.log(response.data);
  return response.data;
};

// A temporary function to get a mock formula's name
const getFormulaName: any = (formulaId) => {
  const formula = mockFormulas.find(formula => formula.id === formulaId);
  const formulaName = formula ? formula.name : 'None';
  return formulaName;
};

// A temporary function to get a mock formula's attributes
const getFormulaAttributes: any = (formulaId) => {
  const formula = mockFormulas.find(formula => formula.id === formulaId);
  const formulaAttributes = formula ? formula.attributes : '';
  return formulaAttributes;
};

// A function for getting the displayable label from a label key
// for example: the label key maxPoints would return Max Points
const getAttributeLabel: any = (labelKey) => {
  const splitString = labelKey.split(/(?=[A-Z])/);
  const label = splitString.join(' ');
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
  return capitalizedLabel;
};

export default { getFormulas, getFormulaDetails, setFormula, getFormulaName, getFormulaAttributes, getAttributeLabel };
