// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type CourseData,
  CourseDataArraySchema,
  type CourseWithFinalGrades,
  CourseWithFinalGradesArraySchema,
  type FullUserData,
  type NewUser,
  type NewUserResponse,
  NewUserResponseSchema,
  type UserData,
  UserDataArraySchema,
  type UserIdArray,
  UserWithRoleArraySchema,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetOwnCourses = (
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> =>
  useQuery({
    queryKey: ['own-courses'],
    queryFn: async () =>
      CourseDataArraySchema.parse(
        (await axios.get('/api/v1/users/own-courses')).data
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
        (await axios.get(`/api/v1/users/${userId}/courses`)).data
      ),
    ...options,
  });

export const useGetStudents = (
  options?: Partial<UseQueryOptions<UserData[]>>
): UseQueryResult<UserData[]> =>
  useQuery({
    queryKey: ['students'],
    queryFn: async () =>
      UserDataArraySchema.parse(
        (await axios.get('/api/v1/users/students')).data
      ),
    ...options,
  });

export const useGetUsers = (
  options?: Partial<UseQueryOptions<FullUserData[]>>
): UseQueryResult<FullUserData[]> =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () =>
      UserWithRoleArraySchema.parse((await axios.get('/api/v1/users')).data),
    ...options,
  });

export const useAddUser = (
  options?: UseMutationOptions<NewUserResponse, unknown, NewUser>
): UseMutationResult<NewUserResponse, unknown, NewUser> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async user =>
      NewUserResponseSchema.parse(
        (await axios.post('/api/v1/users', user)).data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
    },
    ...options,
  });
};

type RemoveUserRoleData = {id: number; role: 'idpUser' | 'admin'};
export const useRemoveUserRole = (
  options?: UseMutationOptions<void, unknown, RemoveUserRoleData>
): UseMutationResult<void, unknown, RemoveUserRoleData> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async userData =>
      axios.delete(`/api/v1/users/${userData.id}?role=${userData.role}`),

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
    mutationFn: async userIds => axios.post('/api/v1/users/delete', userIds),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users']});
      queryClient.invalidateQueries({queryKey: ['students']});
    },
    ...options,
  });
};
