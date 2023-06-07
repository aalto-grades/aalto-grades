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
      const data = await coursesService.addCourse(courseObject);
      console.log(data);
      navigate(`/course-view/${data.course.id}`, { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  };

  return(
    <>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 4 }}>
        Create a New Course
      </Typography>
      <CreateCourseForm addCourse={addCourse}/>
    </>
  );
};

export default CreateCourseView;
