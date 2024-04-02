// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {LoginResult} from '@common/types';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {LoginCredentials, SignupCredentials} from '../../types';
import axios from './axios';

export const useGetRefreshToken = (
  options?: Partial<UseQueryOptions<LoginResult>>
): UseQueryResult<LoginResult> =>
  useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () =>
      (await axios.get<{data: LoginResult}>('/v1/auth/self-info')).data.data,
    ...options,
  });

export const useLogIn = (
  options?: UseMutationOptions<LoginResult, unknown, LoginCredentials>
): UseMutationResult<LoginResult, unknown, LoginCredentials> =>
  useMutation({
    mutationFn: async (credentials: LoginCredentials) =>
      (await axios.post<{data: LoginResult}>('/v1/auth/login', credentials))
        .data.data,
    ...options,
  });

export const useLogOut = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, unknown> =>
  useMutation({
    mutationFn: async () => await axios.post('/v1/auth/logout'),
    ...options,
  });

export const useSignUp = (
  options?: UseMutationOptions<LoginResult, unknown, SignupCredentials>
): UseMutationResult<LoginResult, unknown, SignupCredentials> =>
  useMutation({
    mutationFn: async (credentials: SignupCredentials) =>
      (await axios.post<{data: LoginResult}>('/v1/auth/signup', credentials))
        .data.data,
    ...options,
  });
