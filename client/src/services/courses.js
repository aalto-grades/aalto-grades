// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';

const courses = async () => {
  const response = await axios.get('/v1/user/courses');
  console.log(response.data);
  return response.data;
};

export default {courses};
