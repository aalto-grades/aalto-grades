// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect, ChangeEvent, MouseEvent, SyntheticEvent } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Checkbox, CircularProgress,Typography,
  FormControlLabel, Paper, Switch, Table, TableBody,
  TableCell, TableContainer, TablePagination, TableRow
} from '@mui/material';

import { Status } from 'aalto-grades-common/types';
import CourseResultsTableToolbar from './CourseResultTableToolbar';
import CourseResultsTableHead from './CourseResultsTableHead';
import sortingServices from '../../services/sorting';
import { FinalGrade, State } from '../../types';

function CourseResultsTable(props: {
  students: Array<FinalGrade>,
  calculateFinalGrades: () => Promise<void>,
  downloadCsvTemplate: () => Promise<void>,
  loading: boolean
}): JSX.Element {

  const [order, setOrder]: State<'asc' | 'desc'> = useState<'asc' | 'desc'> ('asc');
  const [orderBy, setOrderBy]: State<string> = useState('studentNumber');
  const [page, setPage]: State<number> = useState(0);
  const [dense, setDense]: State<boolean> = useState(true);
  const [rowsPerPage, setRowsPerPage]: State<number> = useState(25);
  const [search, setSearch]: State<string> = useState('');
  const [studentsToShow, setStudentsToShow]: State<Array<FinalGrade>> = useState(props.students);
  const [selectedStudents, setSelectedStudents]: State<Array<FinalGrade>> =
    useState<Array<FinalGrade>>([]);
  const [allSelected, setAllSelected]: State<boolean> = useState(false);

  useEffect(() => {
    setStudentsToShow(search === '' ? props.students : props.students.filter((s: FinalGrade) => {
      return s.studentNumber.includes(search);
    }));
    setPage(0);
  }, [search, props.students]);

  function handleRequestSort(event: SyntheticEvent, property: string): void {
    const isAsc: boolean = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }

  function handleChangePage(event: MouseEvent | null, newPage: number): void {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement>): void {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function handleChangeDense(event: ChangeEvent<HTMLInputElement>): void {
    setDense(event.target.checked);
  }

  function handleSelectForGrading(studentNumber: string): void {
    let found: Array<FinalGrade> = selectedStudents.filter((value: FinalGrade) => {
      return value.studentNumber === studentNumber;
    });

    // Add to list of selected students.
    if (found.length !== 0) {
      setSelectedStudents(selectedStudents.filter((value: FinalGrade) => {
        return value.studentNumber !== studentNumber;
      }));
    } else {
      found = studentsToShow.filter((value: FinalGrade) => {
        return value.studentNumber === studentNumber;
      });
      setSelectedStudents([...selectedStudents, found[0]]);
    }
  }

  function handleSelectAll(): void {
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsToShow);
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
          selectedStudents={selectedStudents}
        />
        {
          props.loading
            ?
            <Box sx={{
              margin: 'auto', alignItems: 'center', justifyContent: 'center',
              display: 'flex', mt: 3
            }}>
              <CircularProgress />
            </Box>
            :
            <TableContainer>
              <Table
                sx={{ minWidth: 75, mx: 4 }}
                aria-labelledby='courseResultsTable'
                size={dense ? 'small' : 'medium'}
              >
                <CourseResultsTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  handleSelectAll={handleSelectAll}
                  allSelected={allSelected}
                />
                <TableBody>
                  {
                    sortingServices.stableSort(studentsToShow,
                      sortingServices.getComparator(order, orderBy))
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
                              {student.studentNumber}
                            </TableCell>
                            <TableCell
                              sx={{ width: '100px' }}
                              component="th"
                              id={`${student.studentNumber}_credits}`}
                              scope="row"
                              padding="normal"
                            >
                              {student.grade === Status.Pending ? '-' : student.credits}
                            </TableCell>
                            <TableCell
                              sx={{ width: '100px' }}
                              align="left"
                              key={`${student.studentNumber}_grade`}
                            >
                              {student.grade}
                            </TableCell>
                            <TableCell
                              sx={{ width: '100px' }}
                              align="left"
                              key={`${student.studentNumber}_grade_4`}
                            >
                              <Checkbox
                                size="small"
                                onClick={(): void => handleSelectForGrading(student.studentNumber)}
                                checked={selectedStudents.filter((value: FinalGrade) => {
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
                        height: (dense ? 33 : 53) * emptyRows,
                      }}
                    >
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
        }
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          py: '10px'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', ml: 3.5 }}>
            <Typography sx={{ mt: '11px' }}>
              View valid grades from past instances:
            </Typography>
            <Button
              sx={{ ml: 1, mt: '10px', height:'30px' }}
              size='small'
            >
              View all grades
            </Button>
          </Box>
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
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} id='padding-switch'/>}
        label="Dense padding"
      />
    </Box>
  );
}

CourseResultsTable.propTypes = {
  students: PropTypes.array,
  calculateFinalGrades: PropTypes.func,
  downloadCsvTemplate: PropTypes.func,
  loading: PropTypes.bool
};

export default CourseResultsTable;
