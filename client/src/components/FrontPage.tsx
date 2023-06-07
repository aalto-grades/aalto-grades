// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import BasicGrid from './front-page/BasicGrid';
import CourseTable from './front-page/CourseTable';
import coursesService from '../services/courses';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../types/general';

const FrontPage = () => {
  const navigate = useNavigate();
  const [currentCourses, setCurrentCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([]);

  const { auth } = useAuth();

  useEffect(() => {
    coursesService.getCourses(auth.id)
      .then((data) => {
        setCurrentCourses(data.courses.current);
        setPreviousCourses(data.courses.previous);
      })
      .catch((e) => console.log(e.message));
  }, []);

  return(
    <>
      <Box component="span" sx={{ display: 'flex', alignItems: 'center',  justifyContent: 'space-between', flexDirection: 'row' }}>
        <Typography variant="h1" align="left" sx={{ flexGrow: 1 }}>
          Your Current Courses
        </Typography>
        { /* admins are shown the button for creating a new course */
          auth.role == UserRole.Admin &&
          <Button id='ag_new_course_btn' size='large' variant='contained' onClick={() => {
            navigate('/create-course');
          }}>
            Create New Course
          </Button>
        }
      </Box>
      <BasicGrid data={currentCourses}/>
      <Typography variant="h2" align="left" sx={{ flexGrow: 1, mt: 4 }}>
        Inactive Courses
      </Typography>
      <CourseTable data={previousCourses}/>
    </>
  );
};

export default FrontPage;
