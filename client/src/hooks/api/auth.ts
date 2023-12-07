// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {LoginResult} from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import {LoginCredentials, SignupCredentials} from '../../types';

export function useGetRefreshToken(
  options?: UseQueryOptions<LoginResult>
): UseQueryResult<LoginResult> {
  return useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () =>
      (await axios.get('/v1/auth/self-info')).data?.data ?? null,
    ...options,
  });
}

export type UseLogInResult = UseMutationResult<
  LoginResult,
  unknown,
  LoginCredentials
>;

export function useLogIn(
  options?: UseMutationOptions<LoginResult, unknown, LoginCredentials>
): UseLogInResult {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) =>
      (await axios.post('/v1/auth/login', credentials)).data.data,
    ...options,
  });
}

export function useLogOut(
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult {
  return useMutation({
    mutationFn: async () => await axios.post('/v1/auth/logout'),
    ...options,
  });
}

export type UseSignUpResult = UseMutationResult<
  LoginResult,
  unknown,
  SignupCredentials
>;

export function useSignUp(
  options?: UseMutationOptions<LoginResult, unknown, SignupCredentials>
): UseSignUpResult {
  return useMutation({
    mutationFn: async (credentials: SignupCredentials) =>
      (await axios.post('/v1/auth/signup', credentials)).data.data,
    ...options,
  });
}

export function useLogInIdp(
): UseQueryResult<unknown> {

  return useQuery({
    queryKey: ['login-idp'],
    queryFn: async () =>
      (
        await axios.get(
          '/v1/auth/login-idp'
        )
      ).data.data,
    enabled: false
  });
}
