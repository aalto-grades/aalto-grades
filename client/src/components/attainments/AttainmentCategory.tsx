// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { Box, Paper, Typography } from '@mui/material';
import { JSX } from 'react';

import CustomAccordion from './CustomAccordion';

import { getParamLabel } from '../../utils';

// This component renders a top attainment (only has the root attainment as its parent)
export default function AttainmentCategory(props: {
  attainment: AttainmentData,
  buttons?: Array<JSX.Element>,
  paramsFromRoot?: object
}): JSX.Element {
  return (
    <Box boxShadow={3} borderRadius={1} sx={{ pt: 2, pb: 0.5, bgcolor: 'white' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', pr: '21px',
        pb: props.attainment.subAttainments ? '16px' : '0px', pl: '21px'
      }}>
        <Typography align='left' style={{ fontWeight: 'bold' }}>
          {props.attainment.name}
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
        <Box sx={{ display: 'flex' }}>
          <Paper variant='outlined' sx={{ mr: 1, px: 1, py: 0.5 }}>
            <Typography align='left' variant='caption'>
              {'Days valid: ' + props.attainment.daysValid}
            </Typography>
          </Paper>
          {
            (props.paramsFromRoot) && (
              Object.keys(props.paramsFromRoot).map((key: string) => {
                if (props.paramsFromRoot) {
                  return (
                    <Paper key={key} variant='outlined' sx={{ mr: 1, px: 1, py: 0.5 }}>
                      <Typography align='left' variant='caption'>
                        {`${getParamLabel(key)}: ${props.paramsFromRoot[key as keyof object]}`}
                      </Typography>
                    </Paper>
                  );
                }
              })
            )
          }
        </Box>
        {
          (props.buttons) ? (
            <Box sx={{
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
              justifyContent: 'space-between', alignItems: 'center', pl: '21px',
              pr: '6px', pt: '8px'
            }}>
              {props.buttons}
            </Box>
          ) : (
            <Box height='30.5px'></Box>
          )
        }
      </Box>
    </Box>
  );
}
