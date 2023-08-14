// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, AttainmentGradeData, FinalGrade
} from 'aalto-grades-common/types';
import {
  Checkbox, IconButton, Link, TableCell, TableRow, Tooltip
} from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { JSX, useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import GradeOptionsDialog from './GradeOptionsDialog';

import { useGetGradeTreeOfUser } from '../../hooks/useApi';
import { State } from '../../types';
import { findBestGradeOption } from '../../utils';

function GradeCell(props: {
  studentNumber: string,
  attainment: AttainmentData,
  grade: AttainmentGradeData | null
}): JSX.Element {
  const [gradeOptionsOpen, setGradeOptionsOpen]: State<boolean> = useState(false);

  return (
    <>
      <TableCell
        sx={{ width: '100px' }}
        align="left"
      >
        {(props.grade) && (
          findBestGradeOption(props.grade.grades)?.grade ?? '-'
        )}
        {(props.grade && props.grade.grades.length > 1) && (
          <>
            <Tooltip
              placement='top'
              title='Multiple grades, click to show'
            >
              <IconButton
                size='small'
                color='primary'
                sx={{ ml: 1 }}
                onClick={(): void => setGradeOptionsOpen(true)}
              >
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
            <GradeOptionsDialog
              title={`Grades of ${props.studentNumber} for ${props.attainment.name}`}
              options={props.grade.grades}
              open={gradeOptionsOpen}
              handleClose={(): void => setGradeOptionsOpen(false)}
            />
          </>
        )}
      </TableCell>
    </>
  );
}

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

  const [finalGradeOptionsOpen, setFinalGradeOptionsOpen]: State<boolean> = useState(false);

  const gradeTree: UseQueryResult<AttainmentGradeData> = useGetGradeTreeOfUser(
    courseId, assessmentModelId, props.student.userId
  );

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
        align='left'
        key={`${props.student.studentNumber}_checkbox`}
      >
        <Checkbox
          size='small'
          onClick={(): void => props.handleSelectForGrading(props.student.studentNumber)}
          checked={props.selectedStudents.filter((value: FinalGrade) => {
            return value.studentNumber === props.student.studentNumber;
          }).length !== 0}
        />
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        component='th'
        id={props.student.studentNumber}
        scope='row'
        padding='normal'
      >
        <Tooltip
          placement='top'
          title='Click to show individual grades for student'
        >
          <Link
            component='button'
            variant='body2'
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
        component='th'
        id={`${props.student.studentNumber}_credits}`}
        scope='row'
        padding='normal'
      >
        {props.student.grades.length > 0 ? props.student.credits : '-'}
      </TableCell>
      <TableCell
        sx={{ width: '100px' }}
        align='left'
        key={`${props.student.studentNumber}_grade`}
      >
        {findBestGradeOption(props.student.grades)?.grade ?? '-'}
        {(props.student.grades.length > 1) && (
          <>
            <Tooltip
              placement='top'
              title='Multiple final grades, click to show.'
            >
              <IconButton
                size='small'
                color='primary'
                sx={{ ml: 1 }}
                onClick={(): void => setFinalGradeOptionsOpen(true)}
              >
                <MoreHorizIcon/>
              </IconButton>
            </Tooltip>
            <GradeOptionsDialog
              title={`Final grades of ${props.student.studentNumber}`}
              options={props.student.grades}
              open={finalGradeOptionsOpen}
              handleClose={(): void => setFinalGradeOptionsOpen(false)}
            />
          </>
        )}
      </TableCell>
      {(gradeTree.data) && (
        props.attainmentList.map((attainment: AttainmentData) => (
          <GradeCell
            key={`${props.student.studentNumber}_${attainment.name}_grade`}
            studentNumber={props.student.studentNumber}
            attainment={attainment}
            grade={getAttainmentGrade(attainment.id ?? -1)}
          />
        ))
      )}
    </TableRow>
  );
}
