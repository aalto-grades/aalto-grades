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

import {
  AuthData,
  AuthDataSchema,
  ChangePasswordData,
  LoginData,
  LoginResult,
  LoginResultSchema,
  ResetPasswordData,
  ResetPasswordResponse,
  ResetPasswordResponseSchema,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetRefreshToken = (
  options?: Partial<UseQueryOptions<AuthData>>
): UseQueryResult<AuthData> =>
  useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () =>
      AuthDataSchema.parse((await axios.get('/v1/auth/self-info')).data),
    ...options,
  });

export const useLogIn = (
  options?: UseMutationOptions<LoginResult, unknown, LoginData>
): UseMutationResult<LoginResult, unknown, LoginData> =>
  useMutation({
    mutationFn: async (credentials: LoginData) =>
      LoginResultSchema.parse(
        (await axios.post('/v1/auth/login', credentials)).data
      ),
    ...options,
  });

export const useLogOut = (
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, unknown> =>
  useMutation({
    mutationFn: () => axios.post('/v1/auth/logout'),
    ...options,
  });

export const useResetOwnPassword = (
  options?: UseMutationOptions<AuthData, unknown, ResetPasswordData>
): UseMutationResult<AuthData, unknown, ResetPasswordData> =>
  useMutation({
    mutationFn: async (credentials: ResetPasswordData) =>
      AuthDataSchema.parse(
        (await axios.post('/v1/auth/reset-password', credentials)).data
      ),
    ...options,
  });

export const useResetPassword = (
  options?: UseMutationOptions<ResetPasswordResponse, unknown, Numeric>
): UseMutationResult<ResetPasswordResponse, unknown, Numeric> =>
  useMutation({
    mutationFn: async (userId: Numeric) =>
      ResetPasswordResponseSchema.parse(
        (await axios.post(`/v1/auth/reset-password/${userId}`)).data
      ),
    ...options,
  });

export const useChangePassword = (
  options?: UseMutationOptions<unknown, unknown, ChangePasswordData>
): UseMutationResult<unknown, unknown, ChangePasswordData> =>
  useMutation({
    mutationFn: (credentials: ChangePasswordData) =>
      axios.post('/v1/auth/change-password', credentials),
    ...options,
  });
