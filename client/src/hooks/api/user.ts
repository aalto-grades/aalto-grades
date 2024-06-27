// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  CourseData,
  CourseDataArraySchema,
  CourseWithFinalGrades,
  CourseWithFinalGradesArraySchema,
  UserIdArray,
  IdpUsersSchema,
  NewIdpUser,
  UserData,
  UserDataArraySchema,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetOwnCourses = (
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> =>
  useQuery({
    queryKey: ['own-courses'],
    queryFn: async () =>
      CourseDataArraySchema.parse(
        (await axios.get('/v1/users/own-courses')).data
      ),
    ...options,
  });

export const useGetCoursesOfStudent = (
  userId: Numeric,
  options?: Partial<UseQueryOptions<CourseWithFinalGrades[]>>
): UseQueryResult<CourseWithFinalGrades[]> =>
  useQuery({
    queryKey: ['student-courses', userId],
    queryFn: async () =>
      CourseWithFinalGradesArraySchema.parse(
        (await axios.get(`/v1/users/${userId}/courses`)).data
      ),
    ...options,
  });

export const useGetStudents = (
  options?: Partial<UseQueryOptions<UserData[]>>
): UseQueryResult<UserData[]> =>
  useQuery({
    queryKey: ['students'],
    queryFn: async () =>
      UserDataArraySchema.parse((await axios.get('/v1/users/students')).data),
    ...options,
  });

export const useAddUser = (
  options?: UseMutationOptions<unknown, unknown, NewIdpUser>
): UseMutationResult<unknown, unknown, NewIdpUser> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: idpUser => axios.post('/v1/idp-users', idpUser),
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
    mutationFn: userId => axios.delete(`/v1/idp-users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['idp-users']});
      queryClient.invalidateQueries({queryKey: ['students']});
    },
    ...options,
  });
};

export const useDeleteUsers = (
  options?: UseMutationOptions<unknown, unknown, UserIdArray>
): UseMutationResult<unknown, unknown, UserIdArray> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userIds => axios.post('/v1/users/delete', userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['idp-users']});
      queryClient.invalidateQueries({queryKey: ['students']});
    },
    ...options,
  });
};
