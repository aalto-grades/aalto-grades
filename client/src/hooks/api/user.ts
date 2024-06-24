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
  NewUser,
  NewUserResponse,
  NewUserResponseSchema,
  UserData,
  UserDataArraySchema,
  FullUserData,
  UserWithRoleArraySchema,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetOwnCourses = (
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> =>
  useQuery({
    queryKey: ['own-courses'],
    queryFn: async () =>
      CourseDataArraySchema.parse((await axios.get('/v1/user/courses')).data),
    ...options,
  });

export const useGetGradesOfStudent = (
  userId: Numeric,
  options?: Partial<UseQueryOptions<CourseWithFinalGrades[]>>
): UseQueryResult<CourseWithFinalGrades[]> =>
  useQuery({
    queryKey: ['student-grades', userId],
    queryFn: async () =>
      CourseWithFinalGradesArraySchema.parse(
        (await axios.get(`/v1/user/${userId}/grades`)).data
      ),
    ...options,
  });

export const useGetStudents = (
  options?: Partial<UseQueryOptions<UserData[]>>
): UseQueryResult<UserData[]> =>
  useQuery({
    queryKey: ['students'],
    queryFn: async () =>
      UserDataArraySchema.parse((await axios.get('/v1/students')).data),
    ...options,
  });

export const useGetUsers = (
  options?: Partial<UseQueryOptions<FullUserData[]>>
): UseQueryResult<FullUserData[]> =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () =>
      UserWithRoleArraySchema.parse((await axios.get('/v1/users')).data),
    ...options,
  });

export const useAddUser = (
  options?: UseMutationOptions<NewUserResponse, unknown, NewUser>
): UseMutationResult<NewUserResponse, unknown, NewUser> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async idpUser =>
      NewUserResponseSchema.parse(
        (await axios.post('/v1/users', idpUser)).data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
    },
    ...options,
  });
};

export const useDeleteUser = (
  options?: UseMutationOptions<unknown, unknown, number>
): UseMutationResult<unknown, unknown, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => axios.delete(`/v1/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
    },
    ...options,
  });
};
