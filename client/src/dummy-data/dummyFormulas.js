// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const dummyFormulas = [
  {
    name: 'Weighted average',
    attributes: ['Max Points', 'Min required points', 'Weight'],
    codeSnippet: `
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
      };`,
  },  
];
  
export default dummyFormulas;