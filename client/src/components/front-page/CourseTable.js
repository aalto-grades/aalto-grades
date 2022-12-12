// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import CourseTableRow from './CourseTableRow';
import CourseHeadTableRow from './CourseHeadTableRow';
import sortingServices from '../../services/sorting';

const CourseTable = ({data}) => {
  return(
    <Table>
      <TableHead>
        <CourseHeadTableRow/>
      </TableHead>
      <TableBody>
        {data.sort((a, b) => sortingServices.sortByCode(a.courseCode, b.courseCode))
          .slice()
          .map((course) => (
            <CourseTableRow course={course} key={course.id}/>
          ))}
      </TableBody>
    </Table>
  );
};

CourseTable.propTypes = {
  data: PropTypes.array
};
    
export default CourseTable;
