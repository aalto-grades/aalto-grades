// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import {
  Box, Checkbox, CircularProgress, Link, Paper, Table, TableBody,
  TableCell, TableContainer, TablePagination, TableRow, Tooltip
} from '@mui/material';
import { ChangeEvent, MouseEvent, SyntheticEvent, useEffect, useState } from 'react';

import CourseResultsTableHead from './CourseResultsTableHead';
import CourseResultsTableToolbar from './CourseResultTableToolbar';
import StudentGradesDialog from './StudentGradesDialog';

import { getComparator, stableSort } from '../../services/sorting';
import { State } from '../../types';

export default function CourseResultsTable(props: {
  students: Array<FinalGrade>,
  attainmentList: Array<AttainmentData>,
  calculateFinalGrades: () => Promise<void>,
  downloadCsvTemplate: () => Promise<void>,
  loading: boolean,
  selectedStudents: Array<FinalGrade>,
  setSelectedStudents: (students: Array<FinalGrade>) => void,
  hasPendingStudents: boolean
}): JSX.Element {

  const [order, setOrder]: State<'asc' | 'desc'> = useState<'asc' | 'desc'> ('asc');
  const [orderBy, setOrderBy]: State<keyof FinalGrade> =
    useState<keyof FinalGrade>('studentNumber');
  const [page, setPage]: State<number> = useState(0);
  const [rowsPerPage, setRowsPerPage]: State<number> = useState(25);
  const [search, setSearch]: State<string> = useState('');
  const [studentsToShow, setStudentsToShow]: State<Array<FinalGrade>> = useState(props.students);
  const [allSelected, setAllSelected]: State<boolean> = useState(false);
  const [showUserGrades, setShowUserGrades]: State<boolean> = useState(false);
  const [user, setUser]: State<FinalGrade | null> = useState<FinalGrade | null>(null);

  useEffect(() => {
    setStudentsToShow(search === '' ? props.students : props.students.filter((s: FinalGrade) => {
      return s.studentNumber.includes(search);
    }));
    setPage(0);
  }, [search, props.students]);

  function handleRequestSort(_event: SyntheticEvent, property: keyof FinalGrade): void {
    const isAsc: boolean = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }

  function handleChangePage(_event: MouseEvent | null, newPage: number): void {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement>): void {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function handleSelectForGrading(studentNumber: string): void {
    let found: Array<FinalGrade> = props.selectedStudents.filter((value: FinalGrade) => {
      return value.studentNumber === studentNumber;
    });

    // Add to list of selected students.
    if (found.length !== 0) {
      props.setSelectedStudents(props.selectedStudents.filter((value: FinalGrade) => {
        return value.studentNumber !== studentNumber;
      }));
    } else {
      found = studentsToShow.filter((value: FinalGrade) => {
        return value.studentNumber === studentNumber;
      });
      props.setSelectedStudents([...props.selectedStudents, found[0]]);
    }
  }

  function handleSelectAll(): void {
    if (allSelected) {
      props.setSelectedStudents([]);
    } else {
      props.setSelectedStudents(studentsToShow);
    }
    setAllSelected(!allSelected);
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows: number =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - studentsToShow.length) : 0;

  return (
    <Box sx={{ width: '100%', minWidth: '600px' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <CourseResultsTableToolbar
          search={search}
          setSearch={setSearch}
          calculateFinalGrades={props.calculateFinalGrades}
          downloadCsvTemplate={props.downloadCsvTemplate}
          selectedStudents={props.selectedStudents}
          hasPendingStudents={props.hasPendingStudents}
        />
        {
          (props.loading) ? (
            <Box sx={{
              margin: 'auto', alignItems: 'center', justifyContent: 'center',
              display: 'flex', mt: 3
            }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table
                sx={{ minWidth: 75, mx: 4 }}
                aria-labelledby='courseResultsTable'
                size='small'
              >
                <CourseResultsTableHead
                  attainmentList={props.attainmentList}
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  handleSelectAll={handleSelectAll}
                  allSelected={allSelected}
                />
                <TableBody>
                  {
                    stableSort(studentsToShow,
                      getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((student: FinalGrade) => {
                        return (
                          <TableRow
                            hover
                            tabIndex={-1}
                            key={student.studentNumber}
                          >
                            <TableCell
                              sx={{ width: '100px' }}
                              component="th"
                              id={student.studentNumber}
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
                                    setUser(student);
                                    setShowUserGrades(true);
                                  }}
                                >
                                  {student.studentNumber}
                                </Link>
                              </Tooltip>
                            </TableCell>
                            <TableCell
                              sx={{ width: '100px' }}
                              component="th"
                              id={`${student.studentNumber}_credits}`}
                              scope="row"
                              padding="normal"
                            >
                              {student.grades.length > 0 ? student.credits : '-'}
                            </TableCell>
                            <TableCell
                              sx={{ width: '100px' }}
                              align="left"
                              key={`${student.studentNumber}_grade`}
                            >
                              {student.grades.length > 0 ? student.grades[0].grade : 0}
                            </TableCell>
                            <TableCell
                              sx={{ width: '100px' }}
                              align="left"
                              key={`${student.studentNumber}_checkbox`}
                            >
                              <Checkbox
                                size="small"
                                onClick={(): void => handleSelectForGrading(student.studentNumber)}
                                checked={props.selectedStudents.filter((value: FinalGrade) => {
                                  return value.studentNumber === student.studentNumber;
                                }).length !== 0}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: 33 * emptyRows
                      }}
                    >
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )
        }
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          py: '10px'
        }}>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 500]}
            component="div"
            count={studentsToShow.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>
      <StudentGradesDialog
        user={user as FinalGrade}
        setOpen={setShowUserGrades}
        open={showUserGrades}
      />
    </Box>
  );
}
