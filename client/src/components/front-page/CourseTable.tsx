// SPDX-FileCopyrightText: 2023 The Ossi Developers
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
  Typography,
} from '@mui/material';
import {
  type ChangeEvent,
  type JSX,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {type CourseData, CourseRoleType, SystemRole} from '@/common/types';
import Search from '@/components/shared/Search';
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
      courses.filter((course) => {
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

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setSearchText(e.target.value);
    if (page > 1) setPage(1);
  };

  return (
    <>
      <Grid container justifyContent="flex-start" sx={{mt: 1}}>
        <Search
          value={searchText}
          onChange={onChange}
          reset={() => setSearchText('')}
          sx={{minWidth: 300}}
        />
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            {headCells.map(headCell =>
              headCell.id === 'code'
                ? (
                    <TableCell key={headCell.id}>
                      <TableSortLabel active direction="asc">
                        <Typography sx={{fontWeight: 'bold'}}>
                          {headCell.label}
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                  )
                : (
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
          {sortedCourses.length === 0
            ? (
                <TableRow>
                  <TableCell align="center" colSpan={4}>
                    {t('front-page.no-results')}
                  </TableCell>
                </TableRow>
              )
            : (
                coursePage.map(course => (
                  <TableRow
                    key={course.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:focus': {backgroundColor: 'rgba(0, 0, 0, 0.04)'},
                    }}
                    role="button"
                    onClick={async () =>
                      navigate(`/${course.id}`, {
                        viewTransition: true,
                      })}
                    onKeyDown={(e) => {
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
                ))
              )}
        </TableBody>
      </Table>
      {sortedCourses.length > coursesPerPage && (
        <Pagination
          count={
            sortedCourses.length === courses.length
              ? Math.ceil(courses.length / coursesPerPage)
              : Math.ceil(sortedCourses.length / coursesPerPage)
          }
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          sx={{mt: 1}}
        />
      )}
    </>
  );
};

export default CourseTable;
