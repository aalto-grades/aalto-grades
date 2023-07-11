// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SyntheticEvent } from 'react';
import PropTypes from 'prop-types';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

interface Colum {
  id: string,
  name: string
}

function CourseResultsTableHead(props: {
  order: 'asc' | 'desc',
  orderBy: string,
  onRequestSort: (event: SyntheticEvent, property: string) => void
}): JSX.Element {

  const rows: Array<Colum> = [
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

  function createSortHandler(property: string) {
    return (event: SyntheticEvent) => {
      props.onRequestSort(event, property);
    };
  }

  return (
    <TableHead>
      <TableRow>
        {
          rows.map((column: Colum) => (
            <TableCell
              key={column.id}
              align='left'
              padding='normal'
              sortDirection={props.orderBy === column.id ? props.order : false}
            >
              <TableSortLabel
                active={props.orderBy === column.id}
                direction={props.orderBy === column.id ? props.order : 'asc'}
                onClick={createSortHandler(column.id)}
              >
                {column.name}
                {
                  props.orderBy === column.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null
                }
              </TableSortLabel>
            </TableCell>
          ))
        }
      </TableRow>
    </TableHead>
  );
}

CourseResultsTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.any.isRequired
};

export default CourseResultsTableHead;
