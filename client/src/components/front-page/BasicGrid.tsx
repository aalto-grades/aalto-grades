// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Grid2 from '@mui/material/Unstable_Grid2';
import CourseCard from './CourseCard';


const BasicGrid = ({ data }) => {
  return (
    <Grid2 container spacing={3} sx={{ my: 2 }}>
      {data.map(course => {
        return (
          <Grid2 xs={12} sm={6} md={6} lg={4} xl={3} key={course.id}>
            <CourseCard course={course}/>
          </Grid2>
        );
      })}
    </Grid2>
  );
};

BasicGrid.propTypes = {
  data: PropTypes.array
};

export default BasicGrid;