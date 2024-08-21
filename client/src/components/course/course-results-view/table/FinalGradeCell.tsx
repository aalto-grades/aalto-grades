// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {MoreVert} from '@mui/icons-material';
import {Box, IconButton, Tooltip, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {FinalGradeData, GradingScale} from '@/common/types';
import {findBestFinalGrade, getGradeString} from '@/utils';
import EditFinalGradesDialog from './EditFinalGradesDialog';

type FinalGradeCellProps = {
  userId: number;
  studentNumber: string;
  finalGrades: FinalGradeData[];
  gradingScale: GradingScale;
};
const FinalGradeCell = ({
  userId,
  studentNumber,
  finalGrades,
  gradingScale,
}: FinalGradeCellProps): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [hover, setHover] = useState<boolean>(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const bestFinalGrade = findBestFinalGrade(finalGrades);

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
      <span>{getGradeString(t, gradingScale, bestFinalGrade?.grade)}</span>
      {/* If there are multiple final grades "show more" icon*/}
      {(finalGrades.length > 1 || hover) && (
        <Tooltip
          placement="top"
          title={
            finalGrades.length <= 1
              ? t('course.results.edit-final')
              : t('course.results.multiple-final')
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
      )}
      <EditFinalGradesDialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        userId={userId}
        finalGrades={finalGrades}
        title={t('course.results.final-of', {user: studentNumber})}
      />
      {bestFinalGrade?.date !== undefined && (
        <Tooltip
          placement="top"
          title={t('course.results.final-on-date', {
            date: bestFinalGrade.date.toString(),
          })}
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
            {bestFinalGrade.date.toLocaleDateString()}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default FinalGradeCell;
