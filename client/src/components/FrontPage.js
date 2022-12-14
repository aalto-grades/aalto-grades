// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import BasicGrid from './front-page/BasicGrid';
import CourseTable from './front-page/CourseTable';
import coursesService from '../services/courses';
import { useNavigate } from 'react-router-dom';

const FrontPage = () => {
  const navigate = useNavigate();
  const [currentCourses, setCurrentCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([]);

  useEffect(() => {
    coursesService.getCourses()
      .then((data) => setCurrentCourses(data.courses.current))
      .catch((e) => console.log(e.message));
  }, []);

  useEffect(() => {
    coursesService.getCourses()
      .then((data) => setPreviousCourses(data.courses.previous))
      .catch((e) => console.log(e.message));
  }, []);

  return(
    <>
      <Box component="span" sx={{ display: 'flex', alignItems: 'center',  justifyContent: 'space-between', flexDirection: 'row' }}>
        <Typography variant="h3" component="div" align="left" sx={{ flexGrow: 1 }}>
                Your Current Courses
        </Typography>
        <Button size='large' variant='contained' onClick={() => { navigate('/create-course'); }}>
                Create New Course
        </Button>
      </Box>
      <BasicGrid data={currentCourses}/>
      <Typography variant="h4" component="div" align="left" sx={{ flexGrow: 1, mt: 4 }}>
                Inactive Courses
      </Typography>
      <CourseTable data={previousCourses}/>
    </>
  );
};

export default FrontPage;
