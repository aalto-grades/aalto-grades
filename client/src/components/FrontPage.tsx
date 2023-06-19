// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BasicGrid from './front-page/BasicGrid';
import CourseTable from './front-page/CourseTable';
import coursesService from '../services/courses';
import useAuth from '../hooks/useAuth';

const FrontPage = (): JSX.Element => {
  const [currentCourses, setCurrentCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([]);

  const { auth } = useAuth();

  useEffect(() => {
    coursesService.getCoursesOfUser(auth.id)
      .then((data) => {
        setCurrentCourses(data.courses.current);
        setPreviousCourses(data.courses.previous);
      })
      .catch((e) => console.log(e.message));
  }, []);

  return (
    <>
      <Box component="span" sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexDirection: 'row'
      }}>
        <Typography variant="h1" align="left" sx={{ flexGrow: 1 }}>
          Your Current Courses
        </Typography>
      </Box>
      <BasicGrid data={currentCourses} />
      <Typography variant="h2" align="left" sx={{ flexGrow: 1, mt: 4 }}>
        Inactive Courses
      </Typography>
      <CourseTable data={previousCourses} />
    </>
  );
};

export default FrontPage;
