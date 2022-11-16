import React from 'react';
import PropTypes from 'prop-types';
import Grid2 from '@mui/material/Unstable_Grid2';
import CourseCard from './CourseCard';

// disableEqualOverflow ?
// is course code unique for all here?
// xs, sm etc
const BasicGrid = ({data}) => {
  return(
    <Grid2 container spacing={3}>
      {data.map(course => {
        return(
          <Grid2 xs={12} sm={6} md={6} lg={4} xl={3} key={course.code}>
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