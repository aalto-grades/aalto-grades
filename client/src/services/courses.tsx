// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import axios from './axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { FullResponse, Numeric } from '../types';

export function getCoursesOfUser(userId: Numeric): UseQueryResult<Array<CourseData>> {

  const query: UseQueryResult<Array<CourseData>> = useQuery({
    queryKey: ['courses-of-user', userId],
    queryFn: async () => (
      await axios.get(`/v1/user/${userId}/courses`)
    ).data.data.courses
  });

  return query;
}

export function getCourse(courseId: Numeric): UseQueryResult<CourseData> {

  const query: UseQueryResult<CourseData> = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => (
      await axios.get(`/v1/courses/${courseId}`)
    ).data.data.course
  });

  return query;
}

export function getAllCourses(): UseQueryResult<Array<CourseData>> {

  const query: UseQueryResult<Array<CourseData>> = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => (
      await axios.get('/v1/courses')
    ).data.data.courses
  });

  return query;
}

export async function addCourse(course: CourseData): Promise<number> {

  const response: FullResponse<{ course: { id: number } }> =
    await axios.post('/v1/courses', course);

  return response.data.data.course.id;
}
