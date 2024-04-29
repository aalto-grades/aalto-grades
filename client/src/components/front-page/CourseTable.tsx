// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import {JSX} from 'react';
import {useNavigate} from 'react-router-dom';

import {CourseData, SystemRole} from '@common/types';
import useAuth from '../../hooks/useAuth';
import {HeadCellData} from '../../types';

const headCells: HeadCellData[] = [
  {id: 'code', label: 'Code'},
  {id: 'name', label: 'Name'},
  {id: 'department', label: 'Organizing department'},
  {id: 'role', label: 'Role'},
];

const CourseTable = ({courses}: {courses: CourseData[]}): JSX.Element => {
  const navigate = useNavigate();
  const {auth} = useAuth();

  const getCourseRole = (course: CourseData): string => {
    if (auth === null) return 'Not logged in';
    if (auth.role === SystemRole.Admin) return 'Admin';

    const {teachersInCharge, assistants} = course;
    const isTeacher = teachersInCharge.find(teacher => teacher.id === auth.id);
    const isAssistant = assistants.find(assistant => assistant.id === auth.id);

    if (isTeacher !== undefined) return 'Teacher';
    if (isAssistant !== undefined) return 'Assistant';
    return 'Student';
  };

  return (
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
        {courses
          .sort((a, b) => {
            const codeA = a.courseCode.toUpperCase();
            const codeB = b.courseCode.toUpperCase();
            if (codeA < codeB) return -1;
            if (codeA > codeB) return 1;
            return 0;
          })
          .map(course => (
            <TableRow
              id={`ag_see_instances_tr_${course.id}`}
              key={course.id}
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
              <TableCell>{getCourseRole(course)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default CourseTable;
