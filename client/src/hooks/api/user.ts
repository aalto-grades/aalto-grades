// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AddIdpUser,
  CourseData,
  CourseDataArraySchema,
  IdpUsersSchema,
} from '@common/types';
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
      CourseDataArraySchema.parse(
        (await axios.get(`/v1/user/${userId}/courses`)).data
      ),
    ...options,
  });
};

export const useAddUser = (
  options?: UseMutationOptions<unknown, unknown, AddIdpUser>
): UseMutationResult<unknown, unknown, AddIdpUser> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async idpUser => await axios.post('/v1/idp-users', idpUser),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['idp-users']});
    },
    ...options,
  });
};

export const useGetIdpUsers = (
  options?: Partial<UseQueryOptions<{email: string | null; id: number}[]>>
): UseQueryResult<{email: string | null; id: number}[]> =>
  useQuery({
    queryKey: ['idp-users'],
    queryFn: async () =>
      IdpUsersSchema.parse((await axios.get('/v1/idp-users')).data),
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
