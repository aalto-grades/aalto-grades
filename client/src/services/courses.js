// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const getCourses = async () => {
  const response = await axios.get('/v1/user/8/courses');
  console.log(response.data);
  return response.data.data;
};

// .data added here too, not tested though
const addCourse = async (course) => {
  const response = await axios.post('/v1/courses', course);
  return response.data.data;
};

export default { getCourses, addCourse };
