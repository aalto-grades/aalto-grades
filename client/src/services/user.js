// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const login = async credentials => {
  console.log(credentials);
  const response = await axios.post('/v1/auth/login', credentials);
  return response.data;
};

const signup = async credentials => {
  console.log(credentials);
  const response = await axios.post('/v1/auth/signup', credentials);
  return response.data;
};

const isLoggedIn = () => {
  const loggedUserJSON = window.localStorage.getItem('loggedUser');
  if (loggedUserJSON) {
    return true;
  }
  return false;
};
  
export default { login, signup, isLoggedIn };
