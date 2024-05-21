// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {EventBusyOutlined, MoreVert} from '@mui/icons-material';
import {Box, IconButton, Tooltip, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {JSX, useState} from 'react';

import {AttainmentGradesData} from '@/common/types';
import EditGradesDialog from './EditGradesDialog';
import {useTableContext} from '../../context/useTableContext';
import {findBestGrade, gradeIsExpired} from '../../utils';

type GradeCellProps = {
  studentNumber: string;
  attainmentResults?: AttainmentGradesData;
};
const GradeCell = ({
  studentNumber,
  attainmentResults,
}: GradeCellProps): JSX.Element => {
  const {gradeSelectOption} = useTableContext();
  const theme = useTheme();

  const [hover, setHover] = useState<boolean>(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const bestGrade = findBestGrade(attainmentResults?.grades ?? [], {
    expiredOption: 'prefer_non_expired',
    gradeSelectOption,
  });
  const isGradeExpired = gradeIsExpired(bestGrade);

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
      {attainmentResults && (attainmentResults.grades.length > 1 || hover) && (
        <>
          <Tooltip
            placement="top"
            title={
              attainmentResults.grades.length <= 1
                ? 'Edit grades'
                : 'Multiple grades, click to show'
            }
          >
            <IconButton
              color="primary"
              sx={{
                position: 'absolute',
                right: '0px',
                top: 'calc(50% - 20px)',
              }}
              onClick={(): void => setGradeDialogOpen(true)}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
        </>
      )}
      {attainmentResults && (
        <EditGradesDialog
          open={gradeDialogOpen}
          onClose={() => setGradeDialogOpen(false)}
          studentNumber={studentNumber}
          attainmentId={attainmentResults.attainmentId}
          title={`Grades of ${studentNumber} for ${attainmentResults.attainmentName}`}
          grades={attainmentResults.grades}
        />
      )}
      {/* If grade is expired, show warning icon */}
      {isGradeExpired && (
        <>
          <Tooltip
            placement="top"
            title={`Grade expired on ${bestGrade?.expiryDate.toString()}`}
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
      {bestGrade?.date && (
        <Tooltip
          placement="top"
          title={`Grade obtained on ${bestGrade.date.toString()}`}
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
            {bestGrade.date.toLocaleDateString()}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default GradeCell;
