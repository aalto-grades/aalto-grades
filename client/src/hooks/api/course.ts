// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseData,
  CourseDataArraySchema,
  CourseDataSchema,
  CreateCourseData,
  IdSchema,
  PartialCourseData,
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
  options?: UseMutationOptions<number, unknown, CreateCourseData>
): UseMutationResult<number, unknown, CreateCourseData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (course: CreateCourseData) =>
      IdSchema.parse((await axios.post('/v1/courses', course)).data),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['all-courses']});
    },
    ...options,
  });
};

type EditCourseVars = {courseId: Numeric; course: PartialCourseData};
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
