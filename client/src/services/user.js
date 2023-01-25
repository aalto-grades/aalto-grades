// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const login = async credentials => {
  const response = await axios.post('/v1/auth/login', credentials);
  return response.data;
};

const signup = async credentials => {
  const response = await axios.post('/v1/auth/signup', credentials);
  return response.data;
};

const getRefreshToken = async () => {
  const response = await axios.get('/v1/auth/self-info');
  return response.data;
};

const logout = async () => {
  const response = await axios.post('/v1/auth/logout');
  return response.data;
};
  
export default { login, signup, getRefreshToken, logout };
