// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationOptions, UseMutationResult,
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
    ).data.data.course,
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
    ).data.data.courses,
    ...options
  });
}

export type UseAddCourseResult = UseMutationResult<
  number, unknown, CourseData
>;

export function useAddCourse(
  options?: UseMutationOptions<number, unknown, CourseData>
): UseAddCourseResult {
  return useMutation({
    mutationFn: async (course: CourseData) => (
      await axios.post('/v1/courses', course)
    ).data.data.course.id,
    ...options
  });
}
