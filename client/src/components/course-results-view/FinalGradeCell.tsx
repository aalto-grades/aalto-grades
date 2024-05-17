// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {MoreVert} from '@mui/icons-material';
import {Box, IconButton, Tooltip, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {JSX, useState} from 'react';

import {FinalGradeData} from '@/common/types';
import EditFinalGradesDialog from './EditFinalGradesDialog';
import {findBestGrade} from '../../utils';

type FinalGradeCellProps = {
  userId: number;
  studentNumber: string;
  finalGrades: FinalGradeData[];
};
const FinalGradeCell = ({
  userId,
  studentNumber,
  finalGrades,
}: FinalGradeCellProps): JSX.Element => {
  const theme = useTheme();

  const [hover, setHover] = useState<boolean>(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const latestGrade = findBestGrade(finalGrades, {
    gradeSelectOption: 'latest',
  });

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: 'relative',
        minWidth: '100px',
        height: '100%',
        fontSize: '0.85rem',
        color: 'inherit',
        bgcolor: 'inherit',
        borderLeft: 'inherit',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      // align="center"
    >
      <span>{latestGrade?.grade ?? '-'}</span>
      {/* If there are multiple final grades "show more" icon*/}
      {(finalGrades.length > 1 || hover) && (
        <>
          <Tooltip
            placement="top"
            title={
              finalGrades.length <= 1
                ? 'Edit final grades'
                : 'Multiple final grades, click to show'
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
      {
        <EditFinalGradesDialog
          open={gradeDialogOpen}
          onClose={() => setGradeDialogOpen(false)}
          userId={userId}
          finalGrades={finalGrades}
          title={`Final grades of ${studentNumber}`}
        />
      }
      {latestGrade?.date && (
        <Tooltip
          placement="top"
          title={`Final grade obtained on ${latestGrade.date.toString()}`}
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
            {latestGrade.date.toLocaleDateString()}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default FinalGradeCell;
