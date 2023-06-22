// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

const CourseResultsTableHead = ({ order, orderBy, onRequestSort }) => {

  const rows = [
    {
      id: 'studentNumber',
      name: 'Student Number'
    },
    {
      id: 'credits',
      name: 'Credits (ECTS)'
    },
    {
      id: 'finalGrade',
      name: 'Final Grade'
    }
  ];

  function createSortHandler(property) {
    return (event) => {
      onRequestSort(event, property);
    };
  }

  return (
    <TableHead>
      <TableRow>
        {rows.map((column) => (
          <TableCell
            key={column.id}
            align='left'
            padding='normal'
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {column.name}
              {orderBy === column.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

CourseResultsTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.any.isRequired
};

export default CourseResultsTableHead;
