// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import CreateCourseForm from './create-course-view/CreateCourseForm';
import coursesService from '../services/courses';

const CreateCourseView = () => {
  const navigate = useNavigate();

  async function addCourse(courseObject): Promise<void> {
    try {
      const courseId: number = await coursesService.addCourse(courseObject);
      navigate(`/course-view/${courseId}`, { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  }

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
