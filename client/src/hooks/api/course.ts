// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData} from '@common/types';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {Numeric} from '../../types';
import axios from './axios';

export const useGetCourse = (
  courseId: Numeric,
  options?: Partial<UseQueryOptions<CourseData>>
): UseQueryResult<CourseData> =>
  useQuery({
    queryKey: ['course', courseId],
    queryFn: async () =>
      (await axios.get<{data: CourseData}>(`/v1/courses/${courseId}`)).data
        .data,
    ...options,
  });

export const useGetAllCourses = (
  options?: Partial<UseQueryOptions<CourseData[]>>
): UseQueryResult<CourseData[]> =>
  useQuery({
    queryKey: ['all-courses'],
    queryFn: async () =>
      (await axios.get<{data: CourseData[]}>('/v1/courses')).data.data,
    ...options,
  });

export const useAddCourse = (
  options?: UseMutationOptions<number, unknown, CourseData>
): UseMutationResult<number, unknown, CourseData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (course: CourseData) =>
      (await axios.post<{data: number}>('/v1/courses', course)).data.data,

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['all-courses']});
    },
    ...options,
  });
};

type EditCourseVars = {courseId: Numeric; course: Partial<CourseData>};

export const useEditCourse = (
  options?: UseMutationOptions<CourseData, unknown, EditCourseVars>
): UseMutationResult<CourseData, unknown, EditCourseVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: EditCourseVars) =>
      (
        await axios.put<{data: CourseData}>(
          `/v1/courses/${vars.courseId}`,
          vars.course
        )
      ).data.data,

    onSuccess: (_data: CourseData, vars: EditCourseVars) => {
      queryClient.invalidateQueries({queryKey: ['course', vars.courseId]});
    },
    ...options,
  });
};
