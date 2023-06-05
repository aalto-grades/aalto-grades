// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const getCourses: any = async (userId) => {
  const response = await axios.get(`/v1/user/${userId}/courses`);
  console.log(response.data);
  return response.data.data;
};

const getCourse: any = async (courseId) => {
  const response = await axios.get(`/v1/courses/${courseId}`);
  return response.data.data;
};

// .data added here too, not tested though
const addCourse: any = async (course) => {
  const response = await axios.post('/v1/courses', course);
  return response.data.data;
};

export default { getCourse, getCourses, addCourse };
