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
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';

import {UserData} from '@/common/types';
import {useGetCoursesOfStudent, useGetStudents} from '@/hooks/useApi';
import {useLocalize} from '@/hooks/useLocalize';

const getString = (student: UserData): string => {
  let string = student.studentNumber!.toString();
  if (student.name) string = `${student.name}, ${string}`;
  if (student.email) string += `, ${student.email}`;
  return string;
};

const StudentsView = (): JSX.Element => {
  const {t} = useTranslation();
  const localize = useLocalize();
  const {userId} = useParams();
  const navigate = useNavigate();
  const students = useGetStudents();

  const urlStudent = useMemo(
    () =>
      userId
        ? (students.data?.find(student => student.id.toString() === userId) ??
          null)
        : null,
    [students.data, userId]
  );
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(
    urlStudent ?? null
  );
  const studentGrades = useGetCoursesOfStudent(selectedStudent?.id as number, {
    enabled: selectedStudent !== null,
  });

  return (
    <>
      <Typography variant="h2" sx={{pb: 2}}>
        {t('students.select')}
      </Typography>
      <Autocomplete
        options={students.data ?? []}
        value={selectedStudent}
        onChange={(_, newValue: UserData | null) => {
          setSelectedStudent(newValue);
          if (newValue !== null) navigate(`/students/${newValue.id}`);
          else navigate('/students');
        }}
        filterOptions={createFilterOptions({stringify: getString})}
        getOptionLabel={getString}
        renderOption={(props, student: UserData) => (
          <Box component="li" {...props}>
            {getString(student)}
          </Box>
        )}
        renderInput={params => <TextField {...params} label={t('general.student')} />}
      />
      {studentGrades.data !== undefined && (
        <>
          <Divider sx={{my: 2}} />
          <Typography variant="h2" sx={{pb: 2}}>
            {t('students.viewing', {
              user:
                selectedStudent?.name ?? selectedStudent?.studentNumber ?? '',
            })}
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{t('general.course')}</TableCell>
                  <TableCell align="right">
                    {t('general.final-grades')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentGrades.data.map(course => (
                  <TableRow
                    key={course.id}
                    hover
                    onClick={() => navigate(`/${course.id}/course-results`)}
                  >
                    <TableCell>{localize(course.name)}</TableCell>
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
