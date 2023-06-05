// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

const CourseResultsTableHead = (props) => {

  const { order, orderBy, onRequestSort, attainments } = props;
  const [rows, setRows] = useState<any>([]);

  useEffect(() => {
    const headObject = [{
      id: 'studentID',
      name: 'Student ID'
    }];
    const tailObject = [{
      id: 'finalGrade',
      name: 'Final Grade'
    }];
    setRows(headObject.concat(attainments).concat(tailObject));
  }, [attainments]);

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  
  return (
    <TableHead>
      <TableRow>
        {rows.map((attainment) => (
          <TableCell
            key={attainment.id}
            align='left'
            padding='normal'
            sortDirection={orderBy === attainment.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === attainment.id}
              direction={orderBy === attainment.id ? order : 'asc'}
              onClick={createSortHandler(attainment.id)}
            >
              {attainment.name}
              {orderBy === attainment.id ? (
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
  orderBy: PropTypes.any.isRequired,
  attainments: PropTypes.array
};

export default CourseResultsTableHead;