// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData} from '@common/types';
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {Numeric} from '../../types';
import axios from './axios';

export const useGetCoursesOfUser = (
  userId: Numeric,
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> => {
  return useQuery({
    queryKey: ['courses-of-user', userId],
    queryFn: async () =>
      (await axios.get<{data: CourseData[]}>(`/v1/user/${userId}/courses`)).data
        .data,
    ...options,
  });
};

export const useAddUser = (
  options?: UseMutationOptions<unknown, unknown, string>
): UseMutationResult<unknown, unknown, string> =>
  useMutation({
    mutationFn: async (email: string) =>
      await axios.post('/v1/idp-users', {email: email}),
    ...options,
  });

export const useGetIdpUsers = (
  options?: Partial<UseQueryOptions<{email: string; id: number}[]>>
): UseQueryResult<{email: string; id: number}[]> =>
  useQuery({
    queryKey: ['idp-users'],
    queryFn: async () =>
      (await axios.get<{data: {email: string; id: number}[]}>('/v1/idp-users'))
        .data.data,
    ...options,
  });

export const useDeleteUser = (
  options?: UseMutationOptions<unknown, unknown, number>
): UseMutationResult<unknown, unknown, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await axios.delete(`/v1/idp-users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['idp-users']});
    },
    ...options,
  });
};
