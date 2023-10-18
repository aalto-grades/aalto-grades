// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Close as CloseIcon,
  Done as DoneIcon, EventBusyOutlined, MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import {
  Checkbox, IconButton, Link, TableCell, TableRow, Theme, Tooltip, useTheme
} from '@mui/material';
import type { } from '@mui/material/themeCssVarsAugmentation';
import { UseQueryResult } from '@tanstack/react-query';
import {
  AttainmentData, AttainmentGradeData, FinalGrade, GradeOption
} from 'aalto-grades-common/types';
import { JSX, useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import GradeOptionsDialog from './GradeOptionsDialog';

import { useGetGradeTreeOfUser } from '../../hooks/useApi';
import { State } from '../../types';
import { findBestGradeOption, isGradeDateExpired } from '../../utils';

function GradeCell(props: {
  studentNumber: string,
  attainment: AttainmentData,
  grade: AttainmentGradeData | null
}): JSX.Element {
  const [gradeOptionsOpen, setGradeOptionsOpen]: State<boolean> = useState(false);
  const theme:Theme = useTheme();
  const bestGrade: GradeOption|null = findBestGradeOption(props.grade?.grades ?? []);
  const isGradeExpired:boolean = isGradeDateExpired(bestGrade?.expiryDate);
  // console.log(bestGrade?.expiryDate, new Date(),bestGrade?.expiryDate < new Date());
  return (
    <TableCell
      sx={{
        position: 'relative',
        width: '100px',
        color : isGradeExpired ? 'error.main' : 'inherit',
        bgcolor : isGradeExpired ?
          `rgba(${theme.vars.palette.error.mainChannel} / 0.1)` : 'inherit',
        borderLeft: isGradeExpired ?
          `1px solid rgba(${theme.vars.palette.error.mainChannel} / 0.3)` : 'inherit',
        borderRight: isGradeExpired ?
          `1px solid rgba(${theme.vars.palette.error.mainChannel} / 0.3)` : 'inherit'
      }}
      align="center"
    >
      <span>
        {( bestGrade?.grade ?? '-'
        )}</span>
      {/* If there are multiple grades "show more" icon*/}
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
      {/* If grade is expired, show warning icon */}
      {(isGradeExpired) && (
        <>
          <Tooltip
            placement='top'
            title={`Grade expired on ${bestGrade?.expiryDate}`}
          >
            {/* <IconButton
                size='small'
                color='error'
                style={{
                  position: 'relative',
                }}
              > */}
            <EventBusyOutlined sx={{
              position: 'absolute',
              float:'left',
              top: '-5%',
              left: '1%',
              width: '15px',
              // transform: 'translate(-50%, -50%)',
              color: `rgba(${theme.vars.palette.error.mainChannel} / 0.7)`,
              // When over color is 100%
              '&:hover': {
                color: `rgba(${theme.vars.palette.error.mainChannel} / 1)`,
              }
            }}/>
            {/* </IconButton> */}
          </Tooltip>
        </>
      )}

    </TableCell>
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
      <TableCell
        sx={{ width: '100px' }}
        align='left'
        key={`${props.student.studentNumber}_exported_info`}
      >
        {(findBestGradeOption(props.student.grades)?.exportedToSisu) ? (
          <Tooltip
            placement='top'
            title={
              `Exported to Sisu at ${findBestGradeOption(props.student.grades)?.exportedToSisu}.`
            }
          >
            <DoneIcon color="success" />
          </Tooltip>
        ) : (
          <Tooltip
            placement='top'
            title='This grade has not been exported to Sisu.'
          >
            <CloseIcon color="action" />
          </Tooltip>
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
