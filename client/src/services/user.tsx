// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LoginResult } from 'aalto-grades-common/types';

import axios from './axios';
import { FullResponse, LoginCredentials, SignupCredentials } from '../types';

async function login(credentials: LoginCredentials): Promise<LoginResult> {

  const response: FullResponse<LoginResult> =
    await axios.post('/v1/auth/login', credentials);

  return response.data.data;
}

async function signup(credentials: SignupCredentials): Promise<LoginResult> {

  const response: FullResponse<LoginResult> =
    await axios.post('/v1/auth/signup', credentials);

  return response.data.data;
}

async function getRefreshToken(): Promise<LoginResult> {

  const response: FullResponse<LoginResult> =
    await axios.get('/v1/auth/self-info');

  return response.data.data;
}

async function logout(): Promise<void> {
  await axios.post('/v1/auth/logout');
}

export default { login, signup, getRefreshToken, logout };
