// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, Status } from 'aalto-grades-common/types';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { JSX } from 'react';

import StudentGradeAccordion from './StudentGradeAccordion';

export default function StudentGradeList(props: {
  grades: AttainmentGradeData,
  gradeToEdit: (grade: AttainmentGradeData) => void
}): JSX.Element {

  return (
    <>
      <Box sx={{ py: 2, bgcolor: 'white' }}>
        <Box sx={{
          display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center', pr: '21px',
          pb: props.grades?.subAttainments ? '16px' : '0px', pl: '21px'
        }}>
          <Typography align='left'>
            <span style={{ fontWeight: 'bold' }}>
              Final Grade:
            </span>
          </Typography>
          <Typography align='left' variant='body2'>
            {'Grade: ' + (
              props.grades.grades.length > 0
                ? `${props.grades.grades[0].grade} - ${props.grades.grades[0].status}`
                : Status.Pending
            )}
          </Typography>
          <Tooltip
            placement="top"
            title={props.grades.grades.length == 0
              ? 'To edit final grade, first calculate it.'
              : ''
            }
          >
            <Box>
              <Button
                disabled={props.grades.grades.length == 0}
                onClick={(): void => {
                  props.gradeToEdit(props.grades);
                }}
              >
                Edit
              </Button>
            </Box>
          </Tooltip>
        </Box>
        {
          props.grades.subAttainments?.map((subAttainment: AttainmentGradeData) => (
            <StudentGradeAccordion
              key={subAttainment.attainmentId}
              attainmentGrade={subAttainment}
              gradeToEdit={props.gradeToEdit}
            />
          ))
        }
      </Box>

    </>
  );
}
