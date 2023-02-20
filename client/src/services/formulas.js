// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

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

export default { getFormulas, setFormula };