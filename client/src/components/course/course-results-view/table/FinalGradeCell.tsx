// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {MoreVert} from '@mui/icons-material';
import {Box, Tooltip, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {type JSX, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';

import type {FinalGradeData, GradingScale, UserData} from '@/common/types';
import IconButtonWithTip from '@/components/shared/IconButtonWithTooltip';
import {findBestFinalGrade, getGradeString} from '@/utils';
import EditFinalGradesDialog from './EditFinalGradesDialog';

type PropsType = {
  user: UserData;
  studentNumber: string;
  finalGrades: FinalGradeData[];
  gradingScale: GradingScale;
};
const FinalGradeCell = ({
  user,
  studentNumber,
  finalGrades,
  gradingScale,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const bestFinalGrade = findBestFinalGrade(finalGrades);

  return (
    <Box
      className="hoverable-container"
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
    >
      <span>{getGradeString(t, gradingScale, bestFinalGrade?.grade)}</span>
      {/* If there are multiple final grades "show more" icon*/}
      <IconButtonWithTip
        defaultVisible={false}
        onClick={(): void => setEditDialogOpen(true)}
        title={
          finalGrades.length <= 1
            ? t('course.results.edit-final')
            : t('course.results.multiple-final')
        }
      >
        <MoreVert />
      </IconButtonWithTip>
      {editDialogOpen && (
        <EditFinalGradesDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          userId={user.id}
          finalGrades={finalGrades}
          title={(
            <>
              {`${t('course.results.final-for')}, `}
              <Trans
                i18nKey={
                  user.name
                    ? 'course.results.number-and-name'
                    : 'course.results.number-no-name'
                }
                components={{bold: <strong />}}
                values={{
                  studentNumber,
                  name: user.name,
                }}
              />
            </>
          )}
        />
      )}
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
              textAlign: 'right',
              fontSize: '0.7rem',
              color: `rgba(${theme.palette.primary.mainChannel} / 0.7)`,
              '&:hover': {
                color: `rgba(${theme.palette.primary.mainChannel} / 1)`,
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
