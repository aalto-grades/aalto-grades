// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData } from 'aalto-grades-common/types';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { JSX } from 'react';
import StudentGradeAccordion from './StudentGradeAccordion';

export default function StudentGradeList(props: {
  grades: AttainmentGradeData
}): JSX.Element {

  return (
    <Box sx={{ py: 2, bgcolor: 'white' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pr: '21px',
        pb: props.grades?.subAttainments ? '16px' : '0px', pl: '21px'
      }}>
        <Typography align='left'>
          <span style={{ fontWeight: 'bold' }}>
            Root:
          </span>
          {` ${props.grades.name} (${props.grades.tag})`}
        </Typography>
        <Typography align='left' variant='body2'>
          {`Grade: ${props.grades.grade} Status: ${props.grades.status}`}
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pl: '21px',
        pr: '6px', pt: '8px'
      }}>
        <Box height='30.5px'></Box>
        {
          props.grades.subAttainments?.map((subAttainment: AttainmentGradeData) => {
            return (
              <StudentGradeAccordion
                key={subAttainment.attainmentId}
                attainmentGrade={subAttainment}
              />
            );
          })
        }
      </Box>
    </Box>
  );
}

StudentGradeList.propTypes = {
  attainment: PropTypes.object
};
