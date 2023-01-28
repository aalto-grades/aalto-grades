// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const getSisuInstances = async (courseId) => {
  const response = await axios.get('/v1/courses/sisu/' + courseId);
  console.log(response.data);
  return response.data;
};

/*const getInstance = async (instanceId) => {
  const response = await axios.get('/v1/courses/sisu/instance/' + instanceId);
  console.log(response.data);
  return response.data;
};*/

export default { getSisuInstances };
