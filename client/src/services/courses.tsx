// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { AxiosResponse } from 'axios';
import { CourseData, CoursesOfUser } from 'aalto-grades-common/types/course';
import { ApiResponse } from '../types/general';

async function getCoursesOfUser(userId: number | string): Promise<CoursesOfUser> {
  const response: AxiosResponse<
    ApiResponse<{ courses: CoursesOfUser }>, unknown
  > = await axios.get(`/v1/user/${userId}/courses`);

  return response.data.data.courses;
}

async function getCourse(courseId: number | string): Promise<CourseData> {
  const response: AxiosResponse<
    ApiResponse<{ course: CourseData }>, unknown
  > = await axios.get(`/v1/courses/${courseId}`);

  return response.data.data.course;
}

async function getAllCourses(): Promise<Array<CourseData>> {
  const response: AxiosResponse<
    ApiResponse<{ courses: Array<CourseData> }>, unknown
  > = await axios.get('/v1/courses');

  return response.data.data.courses;
}

async function addCourse(course: CourseData): Promise<number> {
  const response: AxiosResponse<
    ApiResponse<{ course: { id: number } }>, unknown
  > = await axios.post('/v1/courses', course);

  return response.data.data.course.id;
}

export default { getCoursesOfUser, getCourse, getAllCourses, addCourse };
