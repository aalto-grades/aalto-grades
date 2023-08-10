// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, AttainmentGradeData, FinalGrade, GradeOption
} from 'aalto-grades-common/types';
import {
  Checkbox, IconButton, Link, TableCell, TableRow, Tooltip
} from '@mui/material';
import { MoreHoriz as MenuIcon } from '@mui/icons-material';
import { JSX } from 'react';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import { useGetGradeTreeOfUser } from '../../hooks/useApi';

export default function CourseResultsTableRow(props: {
  student: FinalGrade,
  attainmentList: Array<AttainmentData>,
  selectedStudents: Array<FinalGrade>,
  handleSelectForGrading: (studentNumber: string) => void,
  setUser: (user: FinalGrade) => void,
  setShowUserGrades: (showUserGrades: boolean) => void
}): JSX.Element {

  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const gradeTree: UseQueryResult<AttainmentGradeData> = useGetGradeTreeOfUser(
    courseId, assessmentModelId, props.student.userId
  );

  function bestGradeOption(options: Array<GradeOption>): number {
    let bestSoFar: number = -1;
    for (const option of options) {
      if (option.grade > bestSoFar)
        bestSoFar = option.grade;
    }
    return bestSoFar;
  }

  function getAttainmentGrade(attainmentId: number): AttainmentGradeData | null {
    if (!gradeTree.data)
      return null;

    function traverseTree(grade: AttainmentGradeData): AttainmentGradeData | null {
      if (grade.attainmentId === attainmentId) {
        return grade;
      }

      if (grade.subAttainments) {
        for (const subGrade of grade.subAttainments) {
          const maybeFound: AttainmentGradeData | null = traverseTree(subGrade);
          if (maybeFound)
            return maybeFound;
        }
      }
      return null;
    }

    return traverseTree(gradeTree.data);
  }

  return (
    <TableRow
      hover
      tabIndex={-1}
    >
      <TableCell
        sx={{ width: '100px' }}
        component="th"
        id={props.student.studentNumber}
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
              props.setUser(props.student);
              props.setShowUserGrades(true);
            }}
          >
            {props.student.studentNumber}
          </Link>
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        component="th"
        id={`${props.student.studentNumber}_credits}`}
        scope="row"
        padding="normal"
      >
        {props.student.grades.length > 0 ? props.student.credits : '-'}
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        align="left"
        key={`${props.student.studentNumber}_grade`}
      >
        {props.student.grades.length > 0 ? bestGradeOption(props.student.grades) : '-'}
        {(props.student.grades.length  > 1) && (
          <IconButton size='small' color='primary' sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
      </TableCell>
      {
        gradeTree.data && (
          props.attainmentList.map((attainment: AttainmentData) => {
            const grade: AttainmentGradeData | null = getAttainmentGrade(attainment.id ?? -1);

            return (
              <TableCell
                sx={{ width: '100px' }}
                align="left"
                key={`${props.student.studentNumber}_${attainment.name}_grade`}
              >
                {grade && bestGradeOption(grade.grades)}
                {(grade && grade.grades.length > 1) && (
                  <IconButton size='small' color='primary' sx={{ ml: 1 }}>
                    <MenuIcon />
                  </IconButton>
                )}
              </TableCell>
            );
          })
        )
      }
      <TableCell
        sx={{ width: '100px' }}
        align="left"
        key={`${props.student.studentNumber}_checkbox`}
      >
        <Checkbox
          size="small"
          onClick={(): void => props.handleSelectForGrading(props.student.studentNumber)}
          checked={props.selectedStudents.filter((value: FinalGrade) => {
            return value.studentNumber === props.student.studentNumber;
          }).length !== 0}
        />
      </TableCell>
    </TableRow>
  );
}
