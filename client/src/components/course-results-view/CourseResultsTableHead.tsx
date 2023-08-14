// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FinalGrade } from 'aalto-grades-common/types';
import {
  Box, Checkbox, FormControlLabel, TableCell,
  TableHead, TableRow, TableSortLabel
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { SyntheticEvent } from 'react';

interface Colum {
  id: string,
  name: string
}

export default function CourseResultsTableHead(props: {
  attainmentList: Array<AttainmentData>,
  order: 'asc' | 'desc',
  orderBy: keyof FinalGrade,
  onRequestSort: (event: SyntheticEvent, property: keyof FinalGrade) => void,
  handleSelectAll: () => void,
  allSelected: boolean
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

  for (const attainment of props.attainmentList) {
    rows.push({
      id: String(attainment.id),
      name: attainment.name
    });
  }

  function createSortHandler(property: keyof FinalGrade) {
    return (event: SyntheticEvent) => {
      props.onRequestSort(event, property);
    };
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell
          key='selectAll'
          align='left'
          padding='normal'
        >
          <FormControlLabel
            htmlFor="select-all"
            label="Select all"
            control={(
              <Checkbox
                id="select-all"
                size="small"
                onClick={props.handleSelectAll}
                checked={props.allSelected}
              />
            )}
          />
        </TableCell>
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
                onClick={createSortHandler(column.id as keyof FinalGrade)}
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
