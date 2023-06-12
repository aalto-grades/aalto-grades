// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';

const CourseTableRow = ({ course }) => {
  const navigate = useNavigate();
  const { id, name, courseCode, department } = course;

  return(
    <TableRow
      id={`ag_see_instances_tr_${id}`}
      key={id}
      hover={true}
      onClick={() => {
        navigate('/course-view/' + id);
      }}
    >
      <TableCell>
        <Link
          href={'/course-view/' + id}
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

