// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CourseTable from './front-page/CourseTable';
import coursesService from '../services/courses';
import useAuth from '../hooks/useAuth';

const AllCoursesView = (): JSX.Element => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const { auth } = useAuth();

  useEffect(() => {
    coursesService.getAllCourses()
      .then((data) => {
        setCourses(data.courses);
      })
      .catch((e: Error) => console.log(e.message));
  }, []);

  return (
    <>
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
        <Typography variant="h1" align="left" sx={{ flexGrow: 1 }}>
          Courses
        </Typography>
        { /* Admins are shown the button for creating a new course */
          auth.role == 'SYSADMIN' &&
          <Button id='ag_new_course_btn' size='large' variant='contained' onClick={() => {
            navigate('/create-course');
          }}>
            Create New Course
          </Button>
        }
      </Box>
      <CourseTable data={courses} />
    </>
  );
};

export default AllCoursesView;
