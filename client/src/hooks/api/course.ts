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
  useQueryClient,
} from '@tanstack/react-query';

import {
  CourseData,
  CourseDataArraySchema,
  CourseDataSchema,
  EditCourseData,
  IdSchema,
  NewCourseData,
} from '@/common/types';
import axios from './axios';
import {Numeric} from '../../types';

export const useGetCourse = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<CourseData>>
): UseQueryResult<CourseData> =>
  useQuery({
    queryKey: ['course', courseId],
    queryFn: async () =>
      CourseDataSchema.parse((await axios.get(`/v1/courses/${courseId}`)).data),
    ...options,
  });

export const useGetAllCourses = (
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> =>
  useQuery({
    queryKey: ['all-courses'],
    queryFn: async () =>
      CourseDataArraySchema.parse((await axios.get('/v1/courses')).data),
    ...options,
  });

export const useAddCourse = (
  options?: UseMutationOptions<number, unknown, NewCourseData>
): UseMutationResult<number, unknown, NewCourseData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (course: NewCourseData) =>
      IdSchema.parse((await axios.post('/v1/courses', course)).data),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['all-courses']});
    },
    ...options,
  });
};

type EditCourseVars = {courseId: Numeric; course: EditCourseData};
export const useEditCourse = (
  options?: UseMutationOptions<unknown, unknown, EditCourseVars>
): UseMutationResult<unknown, unknown, EditCourseVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditCourseVars) =>
      await axios.put(`/v1/courses/${vars.courseId}`, vars.course),

    onSuccess: (_data: unknown, vars: EditCourseVars) => {
      queryClient.invalidateQueries({queryKey: ['course', vars.courseId]});
    },
    ...options,
  });
};
