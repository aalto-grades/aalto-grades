// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';

const CourseTableRow = ({ course }) => {
  let navigate = useNavigate();
  const { id, name, courseCode, department } = course;

  return(
    <TableRow
      key={id} 
      hover={true}
      onClick={() => { navigate('/course-view/' + courseCode); }}
    >
      <TableCell>
        <Link 
          href={'/course-view/' + courseCode}
          underline="hover"
          color="inherit"
        >
          {courseCode}
        </Link>
      </TableCell>
      <TableCell>{name.en}</TableCell>
      <TableCell>{department.en}</TableCell>
    </TableRow>
  );
};

CourseTableRow.propTypes = {
  course: PropTypes.object,
  name: PropTypes.string,
  courseCode: PropTypes.string,
  department: PropTypes.string
};

export default CourseTableRow;

