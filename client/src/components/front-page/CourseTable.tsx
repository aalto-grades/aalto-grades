// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import {type JSX, useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {type CourseData, CourseRoleType, SystemRole} from '@/common/types';
import useAuth from '@/hooks/useAuth';
import {useLocalize} from '@/hooks/useLocalize';
import type {HeadCellData} from '@/types';
import {departments, getCourseRole} from '@/utils';

const coursesPerPage = 10;

type PropsType = {courses: CourseData[]};

const CourseTable = ({courses}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const localize = useLocalize();
  const navigate = useNavigate();
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
      if (auth.role === SystemRole.Admin) return t('general.admin');

      const courseRole = getCourseRole(course, auth);
      switch (courseRole) {
        case CourseRoleType.Teacher:
          return t('general.teacher');
        case CourseRoleType.Assistant:
          return t('general.assistant');
        case CourseRoleType.Student:
          return t('general.student');
      }
    },
    [auth, t]
  );

  const getCourseDepartment = useCallback(
    (course: CourseData): string =>
      localize(
        departments.find(dep => dep.id === course.department)!.department
      ),
    [localize]
  );

  const filteredCourses = useMemo(
    () =>
      courses.filter(course => {
        let courseString = `${course.courseCode} ${course.name.en}`;
        courseString += ` ${getCourseDepartment(course)} ${getCourseRoleString(course)}`;
        return courseString.toLowerCase().includes(searchText.toLowerCase());
      }),
    [courses, getCourseDepartment, getCourseRoleString, searchText]
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

  const coursePage = sortedCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  return (
    <>
      <Grid container justifyContent="flex-start" sx={{mt: 1}}>
        <OutlinedInput
          sx={{minWidth: 300}}
          size="small"
          placeholder={t('front-page.search')}
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            if (page > 1) setPage(1);
          }}
          startAdornment={
            <InputAdornment position="start" sx={{color: 'text.primary'}}>
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          }
          endAdornment={
            searchText.length > 0 && (
              <IconButton
                sx={{border: 'none', backgroundColor: 'transparent'}}
                aria-label="reset-filter"
                size="small"
                onClick={() => setSearchText('')}
              >
                <CloseIcon />
              </IconButton>
            )
          }
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
              hover
              sx={{
                cursor: 'pointer',
                '&:focus': {backgroundColor: 'rgba(0, 0, 0, 0.04)'},
              }}
              role="button"
              onClick={() =>
                navigate(`/${course.id}`, {
                  viewTransition: true,
                })
              }
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  navigate(`/${course.id}`, {
                    viewTransition: true,
                  });
                }
              }}
              tabIndex={0}
            >
              <TableCell>{course.courseCode}</TableCell>
              <TableCell>{localize(course.name)}</TableCell>
              <TableCell>{getCourseDepartment(course)}</TableCell>
              <TableCell>{getCourseRoleString(course)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {courses.length > coursesPerPage && (
        <Pagination
          count={Math.ceil(courses.length / coursesPerPage)}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          sx={{mt: 1}}
        />
      )}
    </>
  );
};

export default CourseTable;
