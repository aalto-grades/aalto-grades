// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { AxiosResponse } from 'axios';
import { LoginResult } from 'aalto-grades-common/types/auth';
import { LoginCredentials, SignupCredentials } from '../types/auth';
import { ApiResponse } from '../types/general';

async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const response: AxiosResponse<
    ApiResponse<LoginResult>, unknown
  > = await axios.post('/v1/auth/login', credentials);

  return response.data.data;
}

async function signup(credentials: SignupCredentials): Promise<LoginResult> {
  const response: AxiosResponse<
    ApiResponse<LoginResult>, unknown
  > = await axios.post('/v1/auth/signup', credentials);

  return response.data.data;
}

async function getRefreshToken(): Promise<LoginResult> {
  const response: AxiosResponse<
    ApiResponse<LoginResult>, unknown
  > = await axios.get('/v1/auth/self-info');

  return response.data.data;
}

async function logout(): Promise<void> {
  await axios.post('/v1/auth/logout');
}

export default { login, signup, getRefreshToken, logout };
