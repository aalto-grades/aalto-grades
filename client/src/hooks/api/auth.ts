// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { LoginResult } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationResult, useQuery, UseQueryResult
} from '@tanstack/react-query';

import { LoginCredentials, SignupCredentials } from '../../types';

export function useGetRefreshToken(): UseQueryResult<LoginResult> {
  return useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () => (
      await axios.get('/v1/auth/self-info')
    ).data.data
  });
}

export function useLogIn(credentials: LoginCredentials): UseMutationResult<LoginResult> {
  return useMutation({
    mutationFn: async () => (
      await axios.post('/v1/auth/login', credentials)
    ).data.data
  });
}

export function useLogOut(): UseMutationResult {
  return useMutation({
    mutationFn: async () => (
      await axios.post('/v1/auth/logout')
    )
  });
}

export function useSignUp(credentials: SignupCredentials): UseMutationResult<LoginResult> {
  return useMutation({
    mutationFn: async () => (
      await axios.post('/v1/auth/signup', credentials)
    ).data.data
  });
}
