// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';

const CourseTableRow = ({course}) => {
  let navigate = useNavigate();

  return(
    <TableRow
      key={course.code} 
      hover={true}
      onClick={() => { navigate('/course-view/' + course.code); }}
    >
      <TableCell>
        <Link 
          href={'/course-view/' + course.code}
          underline="hover"
          color="inherit"
        >
          {course.code}
        </Link>
      </TableCell>
      <TableCell>{course.name}</TableCell>
      <TableCell>{course.department}</TableCell>
    </TableRow>
  );
};

CourseTableRow.propTypes = {
  course: PropTypes.object,
  name: PropTypes.string,
  code: PropTypes.string,
  department: PropTypes.string
};

export default CourseTableRow;

