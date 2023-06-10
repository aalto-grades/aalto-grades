// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { LoginResult, SystemRole } from 'aalto-grades-common/types/auth';
import { ApiResponse } from '../types/general';

interface LoginCredentials {
  email: string,
  password: string
}

async function login(credentials: LoginCredentials): Promise<ApiResponse<LoginResult>> {
  const response = await axios.post('/v1/auth/login', credentials);
  return response.data;
}

interface SignupCredentials {
  email: string,
  password: string,
  studentNumber: string,
  name: string,
  role: SystemRole
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
