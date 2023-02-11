// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import CreateCourseForm from './create-course-view/CreateCourseForm';
import coursesService from '../services/courses';

const CreateCourseView = () => {
  const navigate = useNavigate();

  const addCourse = async (courseObject) => {
    try {
      const course = await coursesService.addCourse(courseObject);
      console.log(course);
      navigate('/', { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  };

  return(
    <>
      <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4 }}>
                    Create a New Course
      </Typography>
      <CreateCourseForm addCourse={addCourse}/>
    </>
  );
};

export default CreateCourseView;
