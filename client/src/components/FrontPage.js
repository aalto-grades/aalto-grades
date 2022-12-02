// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Typography from '@mui/material/Typography';
import BasicGrid from './FrontPage/BasicGrid';
import CourseTable from './FrontPage/CourseTable';

const dummyActiveCourses = [{name: 'Human-Computer Interaction', code: 'CS-C3120', department: 'Department of Computer Science'}, 
  {name: 'Software Engineering', code: 'CS-C3150 ', department: 'Department of Computer Science'}, 
  {name: 'Web Software Development', code: 'CS-C3170', department: 'Department of Computer Science'},
  {name: 'Basic Course in C Programming', code: 'ELEC-A7100', department: 'Department of Communications and Networking'},
  {name: 'Tieteen ja tiedon perusteet', code: 'TU-T9300', department: 'Department of Industrial Engineering and Management'}
];

const dummyInactiveCourses = [{name: 'Programming Parallel Computers D', code: 'CS-E4580', department: 'Department of Computer Science'}, 
  {name: 'Tietokoneverkot', code: 'ELEC-C7241', department: 'Department of Communications and Networking'}
];

const FrontPage = () => {
  return(
    <>
      <Typography variant="h3" component="div" align="left" sx={{ flexGrow: 1 }}>
                Your Current Courses
      </Typography>
      <BasicGrid data={dummyActiveCourses}/>
      <Typography variant="h4" component="div" align="left" sx={{ flexGrow: 1, mt: 4 }}>
                Inactive Courses
      </Typography>
      <CourseTable data={dummyInactiveCourses}/>
    </>
  );
};

export default FrontPage;