// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { CourseData } from 'aalto-grades-common/types/course';

async function getCoursesOfUser(userId: number): Promise<{
  courses: {
    current: Array<CourseData>,
    previous: Array<CourseData>
  }
}> {
  const response = await axios.get(`/v1/user/${userId}/courses`);
  console.log(response.data);
  return response.data.data;
}

async function getCourse(courseId: number): Promise<{ course: CourseData }> {
  const response = await axios.get(`/v1/courses/${courseId}`);
  return response.data.data;
}

async function getAllCourses(): Promise<{ courses: Array<CourseData> }> {
  const response = await axios.get('/v1/courses');
  return response.data.data;
}

// .data added here too, not tested though
async function addCourse(course: CourseData): Promise<{ course: { id: number } }> {
  const response = await axios.post('/v1/courses', course);
  return response.data.data;
}

export default { getCoursesOfUser, getCourse, getAllCourses, addCourse };
