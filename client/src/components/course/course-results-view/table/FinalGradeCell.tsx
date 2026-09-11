// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {MoreVert} from '@mui/icons-material';
import {Box, Tooltip, useTheme} from '@mui/material';
import type {Cell} from '@tanstack/react-table';
import {type ReactNode, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';

import type {FinalGradeData, GradingScale} from '@/common/types';
import IconButtonWithTip from '@/components/shared/IconButtonWithTooltip';
import type {features} from '@/components/shared/table/features';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {findBestFinalGrade, findPreviouslyExportedToSisu, getGradeString} from '@/utils';
import EditFinalGradesDialog from './EditFinalGradesDialog';

type PropsType = {
  gradingScale: GradingScale;
  cell: Cell<typeof features, GroupedStudentRow, FinalGradeData[]>;
};
const FinalGradeCell = ({
  gradingScale,
  cell,
}: PropsType): ReactNode => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (cell.getValue() === undefined) return (null);
  if (cell.getIsGrouped()) return (<>{cell.row.groupingValue ?? '-'}</>);
  if (cell.getIsPlaceholder()) return (null);

  const finalGrades = cell.row.original.finalGrades;
  const user = cell.row.original.user;
  const studentNumber = user.studentNumber;

  const bestFinalGrade = findBestFinalGrade(finalGrades);

  const exportedToSisuState = (() => {
    if (!bestFinalGrade) return null;
    if (bestFinalGrade.sisuExportDate)
      if (bestFinalGrade.grade !== 0) return 'exported';
      else return 'zero-exported';
    if (findPreviouslyExportedToSisu(bestFinalGrade, cell.row.original)?.grade) return 'other-exported'; // It's ok because a grade 0 exported is not a problem
    return null;
  })();

  const exportIcon = {
    exported: '✅',
    'zero-exported': '☑️',
    'other-exported': '⚠️',
  };

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
      <Tooltip
        placement="top"
        title={exportedToSisuState ? t(`course.results.exported-tooltip-${exportedToSisuState}`) : undefined}
        disableInteractive
      >
        <span>{exportedToSisuState ? exportIcon[exportedToSisuState] : null}</span>
      </Tooltip>
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
