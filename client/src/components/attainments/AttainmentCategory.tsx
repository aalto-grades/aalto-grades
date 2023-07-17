// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { JSX } from 'react';

import CustomAccordion from './CustomAccordion';

// This component renders a top attainment (only has the root attainment as its parent)
function AttainmentCategory(props: {
  attainment: AttainmentData,
  buttons?: Array<JSX.Element>
}): JSX.Element {
  return (
    <Box boxShadow={3} borderRadius={1} sx={{ pt: 2, pb: 0.5, bgcolor: 'white' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pr: '21px',
        pb: props.attainment.subAttainments ? '16px' : '0px', pl: '21px'
      }}>
        <Typography align='left'>
          <span style={{ fontWeight: 'bold' }}>
            {props.attainment.name} (
          </span>
          {props.attainment.tag}
          <span style={{ fontWeight: 'bold' }}>
            )
          </span>
        </Typography>
        <Typography align='left' variant='body2'>
          {'Formula: ' + props.attainment.formula}
        </Typography>
      </Box>
      {
        props.attainment.subAttainments?.map((subAttainment: AttainmentData) => {
          return (
            <CustomAccordion
              key={subAttainment.id}
              attainment={subAttainment}
            />
          );
        })
      }
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pl: '21px',
        pr: '6px', pt: '8px'
      }}>
        <Typography align='left' variant='caption'>
          {'Days valid: ' + props.attainment.daysValid}
        </Typography>
        {
          props.buttons ?
            <Box sx={{
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
              justifyContent: 'space-between', alignItems: 'center', pl: '21px',
              pr: '6px', pt: '8px'
            }}>
              {props.buttons}
            </Box>
            :
            <Box height='30.5px'></Box>
        }
      </Box>
    </Box>
  );
}

AttainmentCategory.propTypes = {
  attainment: PropTypes.object,
  buttons: PropTypes.array
};

export default AttainmentCategory;
