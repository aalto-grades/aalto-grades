// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import {
  Link, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography
} from '@mui/material';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { HeadCellData } from '../../types';

const headCells: Array<HeadCellData> = [
  {
    id: 'code',
    label: 'Code',
  },
  {
    id: 'name',
    label: 'Name',
  },
  {
    id: 'department',
    label: 'Organizing department',
  },
];

export default function CourseTable(props: {
  courses: Array<CourseData>
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <Table>
      <TableHead>
        <TableRow>
          {
            headCells.map((headCell: HeadCellData) => (
              (headCell.id === 'code') ? (
                <TableCell key={headCell.id}>
                  <TableSortLabel active={headCell.id === 'code'} direction='asc'>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {headCell.label}
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              ) : (
                <TableCell key={headCell.id}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {headCell.label}
                  </Typography>
                </TableCell>
              )
            ))
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          props.courses
            .sort((a: CourseData, b: CourseData) => {
              const codeA: string = a.courseCode.toUpperCase();
              const codeB: string = b.courseCode.toUpperCase();
              if (codeA < codeB) {
                return -1;
              }
              if (codeA > codeB) {
                return 1;
              }
              return 0;
            })
            .slice()
            .map((course: CourseData) => (
              <TableRow
                id={`ag_see_instances_tr_${course.id}`}
                key={course.id}
                hover={true}
                onClick={(): void => {
                  navigate('/course-view/' + course.id);
                }}
              >
                <TableCell>
                  <Link
                    href={'/course-view/' + course.id}
                    underline="hover"
                    color="inherit"
                  >
                    {course.courseCode}
                  </Link>
                </TableCell>
                <TableCell>{course.name.en}</TableCell>
                <TableCell>{course.department.en}</TableCell>
              </TableRow>
            ))
        }
      </TableBody>
    </Table>
  );
}
