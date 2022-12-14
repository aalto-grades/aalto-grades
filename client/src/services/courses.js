// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const getCourses = async () => {
  const response = await axios.get('/user/0/courses');
  console.log(response.data);
  return response.data;
};

const addCourse = async (course) => {
  const response = await axios.post('/user/0/courses', course);
  return response.data;
};

export default { getCourses, addCourse };
