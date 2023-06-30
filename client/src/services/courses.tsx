// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { CourseData } from 'aalto-grades-common/types';
import { FullResponse, Numeric } from '../types';
import { NewCourseData } from '../components/create-course-view/Form';

async function getCoursesOfUser(userId: Numeric): Promise<Array<CourseData>> {

  const response: FullResponse<{ courses: Array<CourseData> }> =
    await axios.get(`/v1/user/${userId}/courses`);

  return response.data.data.courses;
}

async function getCourse(courseId: Numeric): Promise<CourseData> {

  const response: FullResponse<{ course: CourseData }> =
    await axios.get(`/v1/courses/${courseId}`);

  return response.data.data.course;
}

async function getAllCourses(): Promise<Array<CourseData>> {

  const response: FullResponse<{ courses: Array<CourseData> }> =
    await axios.get('/v1/courses');

  return response.data.data.courses;
}

async function addCourse(course: NewCourseData): Promise<number> {

  const response: FullResponse<{ course: { id: number } }> =
    await axios.post('/v1/courses', course);

  return response.data.data.course.id;
}

export default { getCoursesOfUser, getCourse, getAllCourses, addCourse };
