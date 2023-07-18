// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';

import axios from './axios';
import { FullResponse, Numeric } from '../types';

export async function getCoursesOfUser(userId: Numeric): Promise<Array<CourseData>> {

  const response: FullResponse<{ courses: Array<CourseData> }> =
    await axios.get(`/v1/user/${userId}/courses`);

  return response.data.data.courses;
}

export async function getCourse(courseId: Numeric): Promise<CourseData> {

  const response: FullResponse<{ course: CourseData }> =
    await axios.get(`/v1/courses/${courseId}`);

  return response.data.data.course;
}

export async function getAllCourses(): Promise<Array<CourseData>> {

  const response: FullResponse<{ courses: Array<CourseData> }> =
    await axios.get('/v1/courses');

  return response.data.data.courses;
}

export async function addCourse(course: CourseData): Promise<number> {

  const response: FullResponse<{ course: { id: number } }> =
    await axios.post('/v1/courses', course);

  return response.data.data.course.id;
}
