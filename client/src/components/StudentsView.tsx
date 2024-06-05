// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {JSX} from 'react';
import {useParams} from 'react-router-dom';

import {useGetGradesOfStudent} from '../hooks/useApi';

const StudentsView = (): JSX.Element => {
  const {userId} = useParams() as {userId: string};
  const data = useGetGradesOfStudent(userId);
  if (data.data === undefined) return <>students!</>;
  return (
    <>
      <Typography variant="h2" sx={{pb: 2}}>
        Viewing grades for user {userId}
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell align="right">Final grades</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.data.map(course => (
              <TableRow key={`list-item-${course.id}`}>
                <TableCell>{course.name.en}</TableCell>
                <TableCell align="right">
                  {course.finalGrades
                    .map(finalGrade => finalGrade.grade)
                    .join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default StudentsView;
