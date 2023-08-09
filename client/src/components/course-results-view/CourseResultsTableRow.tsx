// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import {
  Checkbox, Link, TableCell, TableRow, Tooltip
} from '@mui/material';
import { JSX } from 'react';

export default function CourseResultsTableRow(props: {
  student: FinalGrade,
  selectedStudents: Array<FinalGrade>,
  handleSelectForGrading: (studentNumber: string) => void,
  setUser: (user: FinalGrade) => void,
  setShowUserGrades: (showUserGrades: boolean) => void
}): JSX.Element {
  return (
    <TableRow
      hover
      tabIndex={-1}
    >
      <TableCell
        sx={{ width: '100px' }}
        component="th"
        id={props.student.studentNumber}
        scope="row"
        padding="normal"
      >
        <Tooltip
          placement="top"
          title="Click to show individual grades for student"
        >
          <Link
            component="button"
            variant="body2"
            onClick={(): void => {
              props.setUser(props.student);
              props.setShowUserGrades(true);
            }}
          >
            {props.student.studentNumber}
          </Link>
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        component="th"
        id={`${props.student.studentNumber}_credits}`}
        scope="row"
        padding="normal"
      >
        {props.student.grades.length > 0 ? props.student.credits : '-'}
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        align="left"
        key={`${props.student.studentNumber}_grade`}
      >
        {props.student.grades.length > 0 ? props.student.grades[0].grade : 0}
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        align="left"
        key={`${props.student.studentNumber}_checkbox`}
      >
        <Checkbox
          size="small"
          onClick={(): void => props.handleSelectForGrading(props.student.studentNumber)}
          checked={props.selectedStudents.filter((value: FinalGrade) => {
            return value.studentNumber === props.student.studentNumber;
          }).length !== 0}
        />
      </TableCell>
    </TableRow>
  );
}
