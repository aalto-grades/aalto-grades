// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SyntheticEvent } from 'react';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';
import { Box, Checkbox, TableCell,TableHead, TableRow, TableSortLabel } from '@mui/material';

interface Colum {
  id: string,
  name: string
}

function CourseResultsTableHead(props: {
  order: 'asc' | 'desc',
  orderBy: string,
  onRequestSort: (event: SyntheticEvent, property: string) => void,
  selectAll: () => void
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
    },
    {
      id: 'select',
      name: 'Select For Grading'
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
                {column.id === 'select' &&
                  <Checkbox
                    onClick={props.selectAll}
                  />
                }
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
  orderBy: PropTypes.any.isRequired,
  selectAll: PropTypes.func
};

export default CourseResultsTableHead;
