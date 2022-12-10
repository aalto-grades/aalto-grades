// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const getCourses = async () => {
  const response = await axios.get('/v1/user/8/courses');
  console.log(response.data);
  return response.data;
};

export default {getCourses};
