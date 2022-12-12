// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Typography from '@mui/material/Typography';
import CreateCourseForm from './create-course-view/CreateCourseForm';

const CreateCourseView = () => {
  return(
    <>
      <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4 }}>
                    Create a New Course
      </Typography>
      <CreateCourseForm/>
    </>
  );
};

export default CreateCourseView;
