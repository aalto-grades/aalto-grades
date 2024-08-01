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
    mutationFn: async user =>
      NewUserResponseSchema.parse((await axios.post('/v1/users', user)).data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
    },
    ...options,
  });
};

export const useDeleteUser = (
  options?: UseMutationOptions<void, unknown, number>
): UseMutationResult<void, unknown, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userId => axios.delete(`/v1/users/${userId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      queryClient.invalidateQueries({queryKey: ['students']});
    },
    ...options,
  });
};

export const useDeleteUsers = (
  options?: UseMutationOptions<void, unknown, UserIdArray>
): UseMutationResult<void, unknown, UserIdArray> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userIds => axios.post('/v1/users/delete', userIds),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      queryClient.invalidateQueries({queryKey: ['students']});
    },
    ...options,
  });
};
