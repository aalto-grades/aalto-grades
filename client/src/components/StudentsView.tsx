// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Autocomplete,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  createFilterOptions,
} from '@mui/material';
import {JSX, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {UserData} from '@/common/types';
import {useGetGradesOfStudent, useGetStudents} from '../hooks/useApi';

const getString = (student: UserData): string => {
  let string = student.studentNumber!.toString();
  if (student.name) string = `${student.name}, ${string}`;
  if (student.email) string += `, ${student.email}`;
  return string;
};

const filterOptions = createFilterOptions<UserData>({
  // Remove commas from filter strings
  stringify: student => getString(student).replaceAll(',', ''),
});

const StudentsView = (): JSX.Element => {
  const {userId} = useParams();
  const navigate = useNavigate();

  const students = useGetStudents();

  const urlStudent = useMemo(
    () =>
      userId
        ? students.data?.find(student => student.id.toString() === userId) ??
          null
        : null,
    [students.data, userId]
  );

  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(
    urlStudent ?? null
  );
  const studentGrades = useGetGradesOfStudent(selectedStudent?.id as number, {
    enabled: selectedStudent !== null,
  });

  return (
    <>
      <Typography variant="h2" sx={{pb: 2}}>
        Select student
      </Typography>
      <Autocomplete
        options={students.data ?? []}
        value={selectedStudent}
        onChange={(event: unknown, newValue: UserData | null) => {
          setSelectedStudent(newValue);
          if (newValue !== null) navigate(`/students/${newValue.id}`);
          else navigate('/students');
        }}
        filterOptions={filterOptions}
        getOptionLabel={getString}
        renderOption={(props, student: UserData) => (
          <Box component="li" {...props}>
            {getString(student)}
          </Box>
        )}
        renderInput={params => <TextField {...params} label="Student" />}
      />
      {studentGrades.data !== undefined && (
        <>
          <Divider sx={{my: 2}} />
          <Typography variant="h2" sx={{pb: 2}}>
            Viewing grades for{' '}
            {selectedStudent?.name ?? selectedStudent?.studentNumber ?? ''}
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
                {studentGrades.data.map(course => (
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
      )}
    </>
  );
};

export default StudentsView;
