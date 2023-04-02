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

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const CourseResultsTable = ({ attainments, students, calculateFinalGrades, updateGrades }) => {

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('studentID');
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [studentsToShow, setStudentsToShow] = useState(students);

  useEffect(() => {
    setStudentsToShow(search === '' ? students : students.filter(s => s.studentID.includes(search)));
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
              attainments = {attainments}
            />
            <TableBody>
              {stableSort(studentsToShow,
                getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => {

                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={student.studentID}
                    >
                      <TableCell
                        sx={{ width: '100px' }}
                        component="th"
                        id={student.studentID}
                        scope="row"
                        padding="normal"
                      >
                        {student.studentID}
                      </TableCell>
                      {attainments.map((attainment) => {
                        return (
                          <TableCell
                            sx={{ width: '100px' }}
                            align="left"
                            key={`${student.studentID}_${attainment.id}`}>
                            {student[attainment.id]}
                          </TableCell>
                        );
                      })}
                      <TableCell
                        sx={{ width: '100px' }}
                        align="left"
                        key={`${student.studentID}_finalGrade`}>
                        {student.finalGrade}
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
  attainments: PropTypes.array,
  students: PropTypes.array,
  calculateFinalGrades: PropTypes.func,
  updateGrades: PropTypes.func
};

export default CourseResultsTable;