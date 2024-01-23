// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData} from 'aalto-grades-common/types';
import axios from './axios';
import {UseMutationOptions, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult, useMutation, useQueryClient, QueryClient} from '@tanstack/react-query';

import {Numeric} from '../../types';

export function useGetCoursesOfUser(
  userId: Numeric,
  options?: UseQueryOptions<Array<CourseData>>
): UseQueryResult<Array<CourseData>> {
  return useQuery({
    queryKey: ['courses-of-user', userId],
    queryFn: async () =>
      (await axios.get(`/v1/user/${userId}/courses`)).data.data,
    ...options,
  });
}

export function useAddUser(
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, string, unknown> {
  return useMutation({
    mutationFn: async (email: string) =>
      (await axios.post('/v1/idp-users', {email: email})).data.data,
    onSuccess: () => {
    },
    ...options,
  });
}

export function useGetIdpUsers(
  options?: UseQueryOptions<Array<{email: string, id: number}>>
): UseQueryResult<Array<{email: string, id: number}>> {
  return useQuery({
    queryKey: ['idp-users'],
    queryFn: async () =>
      (await axios.get('/v1/idp-users')).data.data,
    ...options,
  });
}

export function useDeleteUser(
  options?: UseMutationOptions<unknown, unknown, unknown>
): UseMutationResult<unknown, unknown, number, unknown> {
  const queryClient: QueryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (
        await axios.delete(
          `/v1/idp-users/${id}`
        )
      ).data.data,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ['idp-users']});
      },
      ...options,
  });
}
