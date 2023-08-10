// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, AttainmentGradeData, FinalGrade, GradeOption
} from 'aalto-grades-common/types';
import {
  Checkbox, Link, TableCell, TableRow, Tooltip
} from '@mui/material';
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

  function getGrade(attainmentId: number): number {
    if (!gradeTree.data)
      return -1;

    function traverseTree(grade: AttainmentGradeData): number {
      if (grade.attainmentId === attainmentId) {
        return bestGradeOption(grade.grades);
      }

      if (grade.subAttainments) {
        for (const subGrade of grade.subAttainments) {
          const gradeValue: number = traverseTree(subGrade);
          if (gradeValue >= 0) {
            return gradeValue;
          }
        }
      }
      return -1;
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
      </TableCell>
      {
        gradeTree.data && (
          props.attainmentList.map((attainment: AttainmentData) => (
            <TableCell
              sx={{ width: '100px' }}
              align="left"
              key={`${props.student.studentNumber}_${attainment.name}_grade`}
            >
              {getGrade(attainment.id ?? -1)}
            </TableCell>
          ))
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
