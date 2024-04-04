// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentGradesData, GradeOption} from '@common/types';
import {
  EventBusyOutlined,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import {Box, IconButton, Theme, Tooltip, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {FC, useState} from 'react';

import GradeOptionsDialog from './GradeOptionsDialog';

import {State} from '../../types';
import {findBestGradeOption, isGradeDateExpired} from '../../utils';

type GradeCellProps = {
  studentNumber: string;
  attainemntResults?: AttainmentGradesData;
  finalGrade?: boolean;
};

const GradeCell: FC<GradeCellProps> = (
  props = {finalGrade: false} as GradeCellProps
) => {
  const [gradeOptionsOpen, setGradeOptionsOpen]: State<boolean> =
    useState(false);
  const theme: Theme = useTheme();
  const bestGrade: GradeOption | null = findBestGradeOption(
    props.attainemntResults?.grades ?? [],
    {
      avoidExpired: true,
      preferExpiredToNull: true,
      useLatest: false, // TODO: Read from state?
    }
  );
  const isGradeExpired: boolean = isGradeDateExpired(bestGrade?.expiryDate);
  // console.log(bestGrade?.expiryDate, new Date(),bestGrade?.expiryDate < new Date());
  return (
    <Box
      sx={{
        position: 'relative',
        minWidth: '100px',
        height: '100%',
        color: isGradeExpired ? 'error.main' : 'inherit',
        bgcolor: isGradeExpired
          ? `rgba(${theme.vars.palette.error.mainChannel} / 0.1)`
          : 'inherit',
        borderLeft: isGradeExpired
          ? `1px solid rgba(${theme.vars.palette.error.mainChannel} / 0.3)`
          : 'inherit',
        // borderRight: isGradeExpired
        //   ? `1px solid rgba(${theme.vars.palette.error.mainChannel} / 0.3)`
        //   : 'inherit',
        fontSize: '0.85rem',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      // align="center"
    >
      <span>{bestGrade?.grade ?? '-'}</span>
      {/* If there are multiple grades "show more" icon*/}
      {props.attainemntResults &&
        props.attainemntResults.grades?.length > 1 && (
          <>
            <Tooltip placement="top" title="Multiple grades, click to show">
              <IconButton
                size="small"
                color="primary"
                sx={{ml: 1}}
                onClick={(): void => setGradeOptionsOpen(true)}
              >
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
            <GradeOptionsDialog
              title={`Grades of ${props.studentNumber} for ${
                props.finalGrade
                  ? 'Final Grade'
                  : props.attainemntResults.attainmentName
              }`}
              options={props.attainemntResults.grades}
              open={gradeOptionsOpen}
              handleClose={(): void => setGradeOptionsOpen(false)}
            />
          </>
        )}
      {/* If grade is expired, show warning icon */}
      {isGradeExpired && (
        <>
          <Tooltip
            placement="top"
            title={`Grade expired on ${bestGrade?.expiryDate}`}
          >
            {/* <IconButton
                  size='small'
                  color='error'
                  style={{
                    position: 'relative',
                  }}
                > */}
            <EventBusyOutlined
              sx={{
                position: 'absolute',
                float: 'left',
                top: '-5%',
                left: '1%',
                width: '15px',
                // transform: 'translate(-50%, -50%)',
                color: `rgba(${theme.vars.palette.error.mainChannel} / 0.7)`,
                // When over color is 100%
                '&:hover': {
                  color: `rgba(${theme.vars.palette.error.mainChannel} / 1)`,
                },
              }}
            />
            {/* </IconButton> */}
          </Tooltip>
        </>
      )}
      {
        <Tooltip
          placement="top"
          title={`Grade obtained on ${bestGrade?.date}`}
          disableInteractive
        >
          <Box
            sx={{
              position: 'absolute',
              float: 'right',
              bottom: '-1%',
              right: '1%',
              // width: '100%',
              textAlign: 'right',
              fontSize: '0.7rem',
              // transform: 'translate(-50%, -50%)',
              color: `rgba(${theme.vars.palette.primary.mainChannel} / 0.7)`,
              // When over color is 100%
              '&:hover': {
                // color: `rgba(${theme.vars.palette.error.mainChannel} / 1)`,
              },
            }}
          >
            {bestGrade?.date?.toString()}
          </Box>
        </Tooltip>
      }
    </Box>
  );
};

export default GradeCell;
