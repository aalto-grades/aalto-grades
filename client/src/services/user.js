// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import useAuth from '../hooks/useAuth';

const login = async credentials => {
  const response = await axios.post('/v1/auth/login', credentials);
  return response.data;
};

const signup = async credentials => {
  const response = await axios.post('/v1/auth/signup',
    credentials,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }
  );
  return response.data;
};

const isLoggedIn = () => {
  const { auth } = useAuth();
  const loggedUser = auth?.user;
  if (loggedUser) {
    return true;
  }
  return false;
};
  
export default { login, signup, isLoggedIn };
