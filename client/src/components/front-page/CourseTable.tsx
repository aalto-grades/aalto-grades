// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Grid,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {JSX, useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {CourseData, CourseRoleType, SystemRole} from '@/common/types';
import useAuth from '../../hooks/useAuth';
import {HeadCellData} from '../../types';
import {getCourseRole} from '../../utils/utils';

const headCells: HeadCellData[] = [
  {id: 'code', label: 'Code'},
  {id: 'name', label: 'Name'},
  {id: 'department', label: 'Organizing department'},
  {id: 'role', label: 'Role'},
];

const CourseTable = ({courses}: {courses: CourseData[]}): JSX.Element => {
  const navigate = useNavigate();
  const {auth} = useAuth();
  const [page, setPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');

  const getCourseRoleString = useCallback(
    (course: CourseData): string => {
      if (auth === null) return 'Not logged in';
      if (auth.role === SystemRole.Admin) return 'Admin';

      const courseRole = getCourseRole(course, auth);

      switch (courseRole) {
        case CourseRoleType.Teacher:
          return 'Teacher';
        case CourseRoleType.Assistant:
          return 'Assistant';
        case CourseRoleType.Student:
          return 'Student';
      }
    },
    [auth]
  );

  const filteredCourses = useMemo(
    () =>
      courses.filter(course => {
        let courseString = `${course.courseCode} ${course.name.en}`;
        courseString += ` ${course.department.en} ${getCourseRoleString(course)}`;
        return courseString.toLowerCase().includes(searchText.toLowerCase());
      }),
    [courses, getCourseRoleString, searchText]
  );
  const sortedCourses = useMemo(
    () =>
      filteredCourses.sort((a, b) => {
        const codeA = a.courseCode.toUpperCase();
        const codeB = b.courseCode.toUpperCase();
        if (codeA < codeB) return -1;
        if (codeA > codeB) return 1;
        return 0;
      }),
    [filteredCourses]
  );
  const coursePage = sortedCourses.slice((page - 1) * 10, page * 10);

  return (
    <>
      <Grid container justifyContent="flex-start" sx={{mt: 1}}>
        <TextField
          sx={{minWidth: 300}}
          size="small"
          label="search"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            if (page > 1) setPage(1);
          }}
        />
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            {headCells.map(headCell =>
              headCell.id === 'code' ? (
                <TableCell key={headCell.id}>
                  <TableSortLabel active direction="asc">
                    <Typography sx={{fontWeight: 'bold'}}>
                      {headCell.label}
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              ) : (
                <TableCell key={headCell.id}>
                  <Typography sx={{fontWeight: 'bold'}}>
                    {headCell.label}
                  </Typography>
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {coursePage.map(course => (
            <TableRow
              key={course.id}
              id={`ag-see-instances-tr-${course.id}`}
              hover={true}
              onClick={() =>
                navigate(`/${course.id}/course-results`, {
                  unstable_viewTransition: true,
                })
              }
            >
              <TableCell>{course.courseCode}</TableCell>
              <TableCell>{course.name.en}</TableCell>
              <TableCell>{course.department.en}</TableCell>
              <TableCell>{getCourseRoleString(course)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {courses.length > 10 && (
        <Pagination
          count={Math.ceil(courses.length / 10)}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          sx={{mt: 1}}
        />
      )}
    </>
  );
};

export default CourseTable;
