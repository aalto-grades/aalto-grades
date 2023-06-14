// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CourseResultsTableToolbar from './CourseResultTableToolbar';
import CourseResultsTableHead from './CourseResultsTableHead';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import sortingServices from '../../services/sorting';
import CircularProgress from '@mui/material/CircularProgress';

const CourseResultsTable = ({ students, calculateFinalGrades, updateGrades, loading }) => {
  const [order, setOrder] = useState<any>('asc');
  const [orderBy, setOrderBy] = useState<any>('studentNumber');
  const [page, setPage] = useState<any>(0);
  const [dense, setDense] = useState<any>(true);
  const [rowsPerPage, setRowsPerPage] = useState<any>(25);
  const [search, setSearch] = useState<any>('');
  const [studentsToShow, setStudentsToShow] = useState<any>(students);

  useEffect(() => {
    setStudentsToShow(search === '' ? students : students.filter(s => s.studentNumber.includes(search)));
    setPage(0);
  }, [search, students]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - studentsToShow.length) : 0;

  return (
    <Box sx={{ width: '100%', minWidth: '600px' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <CourseResultsTableToolbar
          search={search}
          setSearch={setSearch}
          calculateFinalGrades={calculateFinalGrades}
          updateGrades={updateGrades}
        />
        { loading
          ?
          <Box sx={{ margin: 'auto', alignItems: 'center', justifyContent: 'center', display: 'flex', mt: 3 }}>
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
              />
              <TableBody>
                { sortingServices.stableSort(studentsToShow,
                  sortingServices.getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => {

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
                          id={student.credits}
                          scope="row"
                          padding="normal"
                        >
                          {student.credits}
                        </TableCell>
                        <TableCell
                          sx={{ width: '100px' }}
                          align="left"
                          key={`${student.studentNumber}_grade`}>
                          {student.grade}
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
            <Typography sx={{ mt: '11px' }} >View valid grades from past instances:</Typography>
            <Button sx={{ ml: 1, mt: '10px', height:'30px' }} size='small'>View all grades</Button>
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
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </Box>
  );
};

CourseResultsTable.propTypes = {
  students: PropTypes.array,
  calculateFinalGrades: PropTypes.func,
  updateGrades: PropTypes.func,
  loading: PropTypes.bool
};

export default CourseResultsTable;
