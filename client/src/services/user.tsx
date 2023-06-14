// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { LoginResult } from 'aalto-grades-common/types/auth';
import { LoginCredentials, SignupCredentials } from '../types/auth';
import { ApiResponse } from '../types/general';

async function login(credentials: LoginCredentials): Promise<ApiResponse<LoginResult>> {
  const response = await axios.post('/v1/auth/login', credentials);
  return response.data;
}

async function signup(credentials: SignupCredentials): Promise<ApiResponse<LoginResult>> {
  const response = await axios.post('/v1/auth/signup', credentials);
  return response.data;
}

async function getRefreshToken(): Promise<ApiResponse<LoginResult>> {
  const response = await axios.get('/v1/auth/self-info');
  return response.data;
}

async function logout(): Promise<ApiResponse<object>> {
  const response = await axios.post('/v1/auth/logout');
  return response.data;
}

export default { login, signup, getRefreshToken, logout };
