// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

import {
  type AuthData,
  AuthDataSchema,
  type ChangeOwnAuthData,
  type ChangeOwnAuthResponse,
  ChangeOwnAuthResponseSchema,
  type ConfirmMfaData,
  type LoginData,
  type LoginResult,
  LoginResultSchema,
  type ResetAuthData,
  type ResetAuthResult,
  ResetAuthResultSchema,
  type ResetOwnPasswordData,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetRefreshToken = (
  options?: Partial<UseQueryOptions<AuthData | null>>
): UseQueryResult<AuthData | null> =>
  useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/auth/self-info');
      if (res.status === 401) return null;
      return AuthDataSchema.parse(res.data);
    },
    ...options,
  });

export const useGetRefreshTokenSuspense = (
  options?: Partial<UseSuspenseQueryOptions<AuthData | null>>
): UseSuspenseQueryResult<AuthData | null> =>
  useSuspenseQuery({
    queryKey: ['refresh-token'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/v1/auth/self-info');
        if (res.status === 401) return null;
        return AuthDataSchema.parse(res.data);
      } catch {
        return null;
      }
    },
    ...options,
  });

export const useLogIn = (
  options?: UseMutationOptions<LoginResult, unknown, LoginData>
): UseMutationResult<LoginResult, unknown, LoginData> =>
  useMutation({
    mutationFn: async credentials =>
      LoginResultSchema.parse(
        (await axios.post('/api/v1/auth/login', credentials)).data
      ),
    ...options,
  });

export const useLogOut = (
  options?: UseMutationOptions<void, unknown>
): UseMutationResult<void, unknown, void> =>
  useMutation({
    mutationFn: async () => axios.post('/api/v1/auth/logout'),
    ...options,
  });

export const useResetOwnPassword = (
  options?: UseMutationOptions<void, unknown, ResetOwnPasswordData>
): UseMutationResult<void, unknown, ResetOwnPasswordData> =>
  useMutation({
    mutationFn: async credentials =>
      axios.post('/api/v1/auth/reset-own-password', credentials),
    ...options,
  });

type ResetAuthVars = {userId: Numeric; resetData: ResetAuthData};
export const useResetAuth = (
  options?: UseMutationOptions<ResetAuthResult, unknown, ResetAuthVars>
): UseMutationResult<ResetAuthResult, unknown, ResetAuthVars> =>
  useMutation({
    mutationFn: async vars =>
      ResetAuthResultSchema.parse(
        (
          await axios.post(
            `/api/v1/auth/reset-auth/${vars.userId}`,
            vars.resetData
          )
        ).data
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
        (await axios.post('/api/v1/auth/change-own-auth', data)).data
      ),
    ...options,
  });

export const useConfirmMfa = (
  options?: UseMutationOptions<void, unknown, ConfirmMfaData>
): UseMutationResult<void, unknown, ConfirmMfaData> =>
  useMutation({
    mutationFn: async data => axios.post('/api/v1/auth/confirm-mfa', data),
    ...options,
  });
