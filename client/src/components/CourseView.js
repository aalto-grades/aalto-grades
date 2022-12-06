// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useParams } from 'react-router-dom';

const CourseView = () => {
  let { courseCode } = useParams();

  return(
    <p>{'Hello course ' + courseCode + '!'}</p>
  );
};

export default CourseView;