// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import axios from './axios';
import {
  QueryClient, useMutation, UseMutationOptions, UseMutationResult,
  useQuery, UseQueryOptions, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useGetCourse(
  courseId: Numeric,
  options?: UseQueryOptions<CourseData>
): UseQueryResult<CourseData> {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => (
      await axios.get(`/v1/courses/${courseId}`)
    ).data.data,
    ...options
  });
}

export function useGetAllCourses(
  options?: UseQueryOptions<Array<CourseData>>
): UseQueryResult<Array<CourseData>> {
  return useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => (
      await axios.get('/v1/courses')
    ).data.data,
    ...options
  });
}

export type UseAddCourseResult = UseMutationResult<
  number, unknown, CourseData
>;

export function useAddCourse(
  queryClient: QueryClient,
  options?: UseMutationOptions<number, unknown, CourseData>
): UseAddCourseResult {
  return useMutation({
    mutationFn: async (course: CourseData) => (
      await axios.post('/v1/courses', course)
    ).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-courses'] });
    },
    ...options
  });
}

interface EditCourseVars {
  courseId: Numeric,
  course: CourseData
}

export type UseEditCourseResult = UseMutationResult<
  CourseData, unknown, EditCourseVars
>;

export function useEditCourse(
  options?: UseMutationOptions<CourseData, unknown, EditCourseVars>
): UseEditCourseResult {
  return useMutation({
    mutationFn: async (vars: EditCourseVars) => (
      await axios.put(`/v1/courses/${vars.courseId}`, vars.course)
    ).data.data,
    ...options
  });
}
