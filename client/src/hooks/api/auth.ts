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
  ChangeOwnAuthData,
  LoginData,
  LoginResult,
  LoginResultSchema,
  ResetOwnPasswordData,
  ResetAuthResult,
  ResetAuthResultSchema,
  ResetAuthData,
  ChangeOwnAuthResponse,
  ChangeOwnAuthResponseSchema,
  ConfirmMfa,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetRefreshToken = (
  options?: Partial<UseQueryOptions<AuthData | null>>
): UseQueryResult<AuthData | null> =>
  useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () => {
      const res = await axios.get('/v1/auth/self-info');
      if (res.status === 401) return null;
      return AuthDataSchema.parse(res.data);
    },
    ...options,
  });

export const useLogIn = (
  options?: UseMutationOptions<LoginResult, unknown, LoginData>
): UseMutationResult<LoginResult, unknown, LoginData> =>
  useMutation({
    mutationFn: async credentials =>
      LoginResultSchema.parse(
        (await axios.post('/v1/auth/login', credentials)).data
      ),
    ...options,
  });

export const useLogOut = (
  options?: UseMutationOptions<void, unknown, void>
): UseMutationResult<void, unknown, void> =>
  useMutation({
    mutationFn: () => axios.post('/v1/auth/logout'),
    ...options,
  });

export const useResetOwnPassword = (
  options?: UseMutationOptions<void, unknown, ResetOwnPasswordData>
): UseMutationResult<void, unknown, ResetOwnPasswordData> =>
  useMutation({
    mutationFn: async credentials =>
      axios.post('/v1/auth/reset-own-password', credentials),
    ...options,
  });

type ResetAuthVars = {userId: Numeric; resetData: ResetAuthData};
export const useResetAuth = (
  options?: UseMutationOptions<ResetAuthResult, unknown, ResetAuthVars>
): UseMutationResult<ResetAuthResult, unknown, ResetAuthVars> =>
  useMutation({
    mutationFn: async vars =>
      ResetAuthResultSchema.parse(
        (await axios.post(`/v1/auth/reset-auth/${vars.userId}`, vars.resetData))
          .data
      ),
    ...options,
  });

export const useResetOwnAuth = (
  options?: UseMutationOptions<
    ChangeOwnAuthResponse,
    unknown,
    ChangeOwnAuthData
  >
): UseMutationResult<ChangeOwnAuthResponse, unknown, ChangeOwnAuthData> =>
  useMutation({
    mutationFn: async data =>
      ChangeOwnAuthResponseSchema.parse(
        (await axios.post('/v1/auth/change-own-auth', data)).data
      ),
    ...options,
  });

export const useConfirmMfa = (
  options?: UseMutationOptions<void, unknown, ConfirmMfa>
): UseMutationResult<void, unknown, ConfirmMfa> =>
  useMutation({
    mutationFn: async data => axios.post('/v1/auth/confirm-mfa', data),
    ...options,
  });
