// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Delete} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import {enqueueSnackbar} from 'notistack';
import {JSX, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {UserData} from '@/common/types';
import {
  useDeleteUser,
  useGetGradesOfStudent,
  useGetStudents,
} from '../hooks/useApi';

const getString = (student: UserData): string => {
  let string = student.studentNumber!.toString();
  if (student.name) string = `${student.name}, ${string}`;
  if (student.email) string += `, ${student.email}`;
  return string;
};

const StudentsView = (): JSX.Element => {
  const {userId} = useParams();
  const navigate = useNavigate();
  const students = useGetStudents();
  const deleteUser = useDeleteUser();

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

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

  const onDelete = async (): Promise<void> => {
    await deleteUser.mutateAsync(selectedStudent!.id);
    setConfirmOpen(false);
    setSelectedStudent(null);
    enqueueSnackbar('Student deleted', {variant: 'success'});
    navigate('/students');
  };

  return (
    <>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            All of the data of the student will be deleted permanently!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={onDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h2" sx={{pb: 2}}>
        Select student
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
        renderInput={params => <TextField {...params} label="Student" />}
      />
      {studentGrades.data !== undefined && (
        <>
          <Divider sx={{my: 2}} />
          <Typography variant="h2" sx={{pb: 2}}>
            Viewing grades for{' '}
            {selectedStudent?.name ?? selectedStudent?.studentNumber ?? ''}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => setConfirmOpen(true)}
            startIcon={<Delete />}
          >
            Delete student data
          </Button>
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
                  <TableRow
                    key={course.id}
                    hover
                    onClick={() => navigate(`/${course.id}/course-results`)}
                  >
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
