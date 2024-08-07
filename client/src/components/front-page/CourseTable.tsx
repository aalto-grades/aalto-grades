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
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {CourseData, CourseRoleType, SystemRole} from '@/common/types';
import useAuth from '../../hooks/useAuth';
import {HeadCellData} from '../../types';
import {getCourseRole} from '../../utils/utils';

const CourseTable = ({courses}: {courses: CourseData[]}): JSX.Element => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {auth} = useAuth();
  const [page, setPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');

  const headCells: HeadCellData[] = [
    {id: 'code', label: t('general.code')},
    {id: 'name', label: t('general.name')},
    {id: 'department', label: t('general.organizing-department')},
    {id: 'role', label: t('general.role')},
  ];

  const getCourseRoleString = useCallback(
    (course: CourseData): string => {
      if (auth === null) return t('front-page.not-logged-in');
      if (auth.role === SystemRole.Admin) return t('general.admin.singular');

      const courseRole = getCourseRole(course, auth);

      switch (courseRole) {
        case CourseRoleType.Teacher:
          return t('general.teacher');
        case CourseRoleType.Assistant:
          return t('general.assistant.singular');
        case CourseRoleType.Student:
          return t('general.student');
      }
    },
    [auth, t]
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
          label={t('front-page.search')}
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
              sx={{
                cursor: 'pointer',
                '&:focus': {backgroundColor: 'rgba(0, 0, 0, 0.04)'},
              }}
              role="button"
              onClick={() =>
                navigate(`/${course.id}/course-results`, {
                  unstable_viewTransition: true,
                })
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  navigate(`/${course.id}/course-results`, {
                    unstable_viewTransition: true,
                  });
                }
              }}
              tabIndex={0}
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
