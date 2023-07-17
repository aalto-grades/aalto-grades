// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import axios from './axios';
import {
  useMutation, UseMutationResult, useQuery, UseQueryResult
} from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useGetCourse(courseId: Numeric): UseQueryResult<CourseData> {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => (
      await axios.get(`/v1/courses/${courseId}`)
    ).data.data.course
  });
}

export function useGetAllCourses(): UseQueryResult<Array<CourseData>> {
  return useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => (
      await axios.get('/v1/courses')
    ).data.data.courses
  });
}

export function useAddCourse(course: CourseData): UseMutationResult<number> {
  return useMutation({
    mutationFn: async () => (
      await axios.post('/v1/courses', course)
    ).data.data.course.id
  });
}
