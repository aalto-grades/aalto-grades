// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
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
  CourseDataSchema,
  type EditCourseData,
  IdSchema,
  type NewCourseData,
} from '@/common/types';
import type {Numeric} from '@/types';
import axios from './axios';

export const useGetCourse = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<CourseData>>
): UseQueryResult<CourseData> =>
  useQuery({
    queryKey: ['course', courseId],
    queryFn: async () =>
      CourseDataSchema.parse(
        (await axios.get(`/api/v1/courses/${courseId}`)).data
      ),
    ...options,
  });

export const useGetAllCourses = (
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> =>
  useQuery({
    queryKey: ['all-courses'],
    queryFn: async () =>
      CourseDataArraySchema.parse((await axios.get('/api/v1/courses')).data),
    ...options,
  });

export const useAddCourse = (
  options?: UseMutationOptions<number, unknown, NewCourseData>
): UseMutationResult<number, unknown, NewCourseData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async course =>
      IdSchema.parse((await axios.post('/api/v1/courses', course)).data),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['all-courses']});
    },
    ...options,
  });
};

type EditCourseVars = {courseId: Numeric; course: EditCourseData};
export const useEditCourse = (
  options?: UseMutationOptions<void, unknown, EditCourseVars>
): UseMutationResult<void, unknown, EditCourseVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async vars =>
      axios.put(`/api/v1/courses/${vars.courseId}`, vars.course),

    onSuccess: (_data: unknown, vars: EditCourseVars) => {
      queryClient.invalidateQueries({queryKey: ['course', vars.courseId]});
    },
    ...options,
  });
};
