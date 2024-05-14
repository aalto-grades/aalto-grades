// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import {LoginResult, LoginResultSchema} from '@/common/types';
import axios from './axios';
import {LoginCredentials} from '../../types';

export const useGetRefreshToken = (
  options?: Partial<UseQueryOptions<LoginResult>>
): UseQueryResult<LoginResult> =>
  useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () =>
      LoginResultSchema.parse((await axios.get('/v1/auth/self-info')).data),
    ...options,
  });

export const useLogIn = (
  options?: UseMutationOptions<LoginResult, unknown, LoginCredentials>
): UseMutationResult<LoginResult, unknown, LoginCredentials> =>
  useMutation({
    mutationFn: async (credentials: LoginCredentials) =>
      LoginResultSchema.parse(
        (await axios.post('/v1/auth/login', credentials)).data
      ),
    ...options,
  });

export const useLogOut = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, unknown> =>
  useMutation({
    mutationFn: async () => await axios.post('/v1/auth/logout'),
    ...options,
  });
