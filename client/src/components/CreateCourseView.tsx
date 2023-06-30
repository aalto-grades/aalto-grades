// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NavigateFunction, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import CreateCourseForm from './create-course-view/Form';
import coursesService from '../services/courses';
import { NewCourseData } from './create-course-view/Form';

function CreateCourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  async function addCourse(course: NewCourseData): Promise<void> {
    try {
      const courseId: number = await coursesService.addCourse(course);
      navigate(`/course-view/${courseId}`, { replace: true });
    } catch (exception) {
      console.log(exception.message);
    }
  }

  return (
    <>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 4 }}>
        Create a New Course
      </Typography>
      <CreateCourseForm addCourse={addCourse}/>
    </>
  );
}

export default CreateCourseView;
