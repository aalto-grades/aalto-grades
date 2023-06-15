// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, FormulaPreview } from '../types/formulas';

export const formulas: Array<FormulaPreview> = [
  {
    id: Formula.WeightedAverage,
    name: 'Weighted average',
    attributes: ['maxPoints', 'minRequiredPoints', 'weight'],
    codeSnippet:
    `const weightedAverage = (nums, weights) => {
      const [sum, weightSum] = weights.reduce(
        (acc, w, i) => {
          acc[0] = acc[0] + nums[i] * w;
          acc[1] = acc[1] + w;
          return acc;
        },
        [0, 0]
      );
      return sum / weightSum;
    };`
  },
  {
    id: Formula.Manual,
    name: 'Manual',
    attributes: ['maxPoints', 'minRequiredPoints'],
    codeSnippet: 'placeholder'
  }
];
