// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const getInstances = async (courseId) => {
  const response = await axios.get(`/v1/courses/${courseId}/instances`);
  return response.data.data;
};

const getSisuInstances = async (courseId) => {
  const response = await axios.get('/v1/sisu/courses/' + courseId);
  console.log(response.data);
  return response.data.data;
};

const getSisuInstance = async (sisuInstanceId) => {
  const response = await axios.get('/v1/sisu/instances/' + sisuInstanceId);
  console.log(response.data);
  return response.data.data;
};

const getAttainments = async (instanceId) => {
  const response = await axios.get('/v1/??' + instanceId);
  console.log(response.data);
  return response.data;
};

export default { getInstances, getSisuInstances, getSisuInstance, getAttainments };
