// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import mockFormulas from '../mock-data/mockFormulas';

const getFormulas = async () => {
  // TODO: specify route
  const response = await axios.get('/??');
  console.log(response.data);
  return response.data;
};

const setFormula = async (formulaInfo) => {
  // TODO: specify route
  const response = await axios.post('/??', formulaInfo);
  console.log(response.data);
  return response.data;
};

// A temporary function to get a mock formula's name
const getFormulaName = (formulaId) => {
  const formula = mockFormulas.find(formula => formula.id === formulaId);
  const formulaName = formula ? formula.name : 'None';
  return formulaName;
};

// A temporary function to get a mock formula's attributes
const getFormulaAttributes = (formulaId) => {
  const formula = mockFormulas.find(formula => formula.id === formulaId);
  const formulaAttributes = formula ? formula.attributes : '';
  return formulaAttributes;
};

export default { getFormulas, setFormula, getFormulaName, getFormulaAttributes };
