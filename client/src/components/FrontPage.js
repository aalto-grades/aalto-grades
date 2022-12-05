// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import BasicGrid from './FrontPage/BasicGrid';
import CourseTable from './FrontPage/CourseTable';
import coursesService from '../services/courses';

const FrontPage = () => {

  const [currentCourses, setCurrentCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([]);

  useEffect(() => {
    coursesService.getCourses()
      .then((data) => setCurrentCourses(data.courses.current));
  }, []);

  useEffect(() => {
    coursesService.getCourses()
      .then((data) => setPreviousCourses(data.courses.previous));
  }, []);

  return(
    <>
      <Typography variant="h3" component="div" align="left" sx={{ flexGrow: 1 }}>
                Your Current Courses
      </Typography>
      <BasicGrid data={currentCourses}/>
      <Typography variant="h4" component="div" align="left" sx={{ flexGrow: 1, mt: 4 }}>
                Inactive Courses
      </Typography>
      <CourseTable data={previousCourses}/>
    </>
  );
};

export default FrontPage;
