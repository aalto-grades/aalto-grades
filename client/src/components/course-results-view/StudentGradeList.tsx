// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData } from 'aalto-grades-common/types';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { JSX } from 'react';



export default function StudentGradeList(props: {
  grades: AttainmentGradeData
}): JSX.Element {

  console.log(props.grades);

  return (
    <Box boxShadow={3} borderRadius={1} sx={{ pt: 2, pb: 0.5, bgcolor: 'white' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pr: '21px',
        pb: props.grades?.subAttainments ? '16px' : '0px', pl: '21px'
      }}>
        <Typography align='left'>
          <span style={{ fontWeight: 'bold' }}>
            {props.grades.name} (
          </span>
          {props.grades.tag}
          <span style={{ fontWeight: 'bold' }}>
            )
          </span>
        </Typography>
        <Typography align='left' variant='body2'>
          {'Manual: ' + props.grades.manual}
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pl: '21px',
        pr: '6px', pt: '8px'
      }}>
        <Typography align='left' variant='caption'>
          {'Grading status: ' + props.grades.status}
        </Typography>
        <Box height='30.5px'></Box>
      </Box>
    </Box>
  );
}

StudentGradeList.propTypes = {
  attainment: PropTypes.object
};
