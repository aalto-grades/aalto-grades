// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AxiosResponse } from 'axios';
import axios from './axios';
import { Formula, FormulaData, FormulaPreview } from 'aalto-grades-common/types';

const mockFormulas: Array<FormulaPreview> = [
  {
    id: Formula.WeightedAverage,
    name: 'Weighted average',
    attributes: ['weight'],
    codeSnippet:
    `
    const weightedAverage = (nums, weights) => {
      const [sum, weightSum] = weights.reduce(
        (acc, w, i) => {
          acc[0] = acc[0] + nums[i] * w;
          acc[1] = acc[1] + w;
          return acc;
        },
        [0, 0]
      );
      return sum / weightSum;
    };
    `,
  },
];

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

// A temporary function to get a mock formula's name
function getFormulaName(formulaId: Formula): string {
  const formula: FormulaPreview = mockFormulas.find(
    (formula: FormulaPreview) => formula.id === formulaId
  );
  const formulaName: string = formula ? formula.name : 'None';
  return formulaName;
}

// A temporary function to get a mock formula's attributes
function getFormulaAttributes(formulaId: Formula): Array<string> {
  const formula: FormulaPreview = mockFormulas.find(
    (formula: FormulaPreview) => formula.id === formulaId
  );
  const formulaAttributes: Array<string> = formula ? formula.attributes : [''];
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
