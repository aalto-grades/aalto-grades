// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  EventBusyOutlined,
  InfoOutlined,
  MoreVert,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {Box, Tooltip, Typography, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {type JSX, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {CourseTaskGradesData, StudentData} from '@/common/types';
import IconButtonWithTip from '@/components/shared/IconButtonWithTooltip';
import {useTableContext} from '@/context/useTableContext';
import {findBestGrade, gradeIsExpired} from '@/utils';
import EditGradesDialog from './EditGradesDialog';

export type GradeCellSourceValue =
  | {
      type: 'courseTask';
      task: CourseTaskGradesData;
      maxGrade: number | null;
      coursePartExpiryDate: Date | null | undefined;
    }
  | {type: 'coursePart'; grade: number | null};

type GradeCellProps = {
  studentUser: StudentData;
  sourceValue: GradeCellSourceValue;
};
const GradeCell = ({studentUser, sourceValue}: GradeCellProps): JSX.Element => {
  const {t} = useTranslation();
  const {gradeSelectOption} = useTableContext();
  const theme = useTheme();

  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const hasInvalidGrade = useMemo(() => {
    if (sourceValue.type === 'coursePart') return false;
    if (sourceValue.maxGrade === null) return false;
    return sourceValue.task.grades.some(
      grade => grade.grade > sourceValue.maxGrade!
    );
  }, [sourceValue]);

  const bestGrade =
    sourceValue.type === 'coursePart'
      ? null
      : findBestGrade(
          sourceValue.task.grades,
          sourceValue.coursePartExpiryDate,
          {
            expiredOption: 'non_expired',
            gradeSelectOption,
          }
        );
  const isGradeExpired = gradeIsExpired(bestGrade);

  return (
    <Box
      className="hoverable-container"
      sx={{
        position: 'relative',
        minWidth: '100px',
        height: '100%',
        color: hasInvalidGrade || isGradeExpired ? 'error.main' : 'inherit',
        bgcolor:
          hasInvalidGrade || isGradeExpired
            ? `rgba(${theme.vars.palette.error.mainChannel} / 0.1)`
            : 'inherit',
        borderLeft:
          hasInvalidGrade || isGradeExpired
            ? `1px solid rgba(${theme.vars.palette.error.mainChannel} / 0.3)`
            : 'inherit',
        fontSize: '0.85rem',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span>
        {sourceValue.type === 'courseTask'
          ? (bestGrade?.grade ?? '-')
          : (sourceValue.grade ?? t('course.results.not-participated'))}
      </span>

      {/* Course task specific elements */}
      {sourceValue.type === 'courseTask' && (
        <>
          <IconButtonWithTip
            onClick={() => setGradeDialogOpen(true)}
            title={
              sourceValue.task.grades.length <= 1
                ? t('course.results.edit-grade')
                : t('course.results.multiple-grade')
            }
          >
            <MoreVert />
          </IconButtonWithTip>
          {gradeDialogOpen && (
            <EditGradesDialog
              open={gradeDialogOpen}
              onClose={() => setGradeDialogOpen(false)}
              studentUser={studentUser}
              courseTaskId={sourceValue.task.courseTaskId}
              maxGrade={sourceValue.maxGrade}
              title={t('course.results.grade-of-for', {
                user: studentUser.studentNumber,
                part: sourceValue.task.courseTaskName,
              })}
              grades={sourceValue.task.grades}
            />
          )}

          {/* Info/warning icons */}
          {/* Contains invalid grades */}
          {hasInvalidGrade && (
            <Tooltip placement="top" title="Invalid grades">
              <WarningAmberOutlined
                sx={{
                  position: 'absolute',
                  float: 'left',
                  top: '-5%',
                  left: '1%',
                  width: '15px',
                  color: `rgba(${theme.vars.palette.error.mainChannel} / 0.7)`,
                  '&:hover': {
                    color: `rgba(${theme.vars.palette.error.mainChannel} / 1)`,
                  },
                }}
              />
            </Tooltip>
          )}
          {/* Expired grade */}
          {!hasInvalidGrade && isGradeExpired && (
            <Tooltip
              placement="top"
              title={t('course.results.grade-expired-on', {
                date: bestGrade?.expiryDate!.toString(),
              })}
            >
              <EventBusyOutlined
                sx={{
                  position: 'absolute',
                  float: 'left',
                  top: '-5%',
                  left: '1%',
                  width: '15px',
                  color: `rgba(${theme.vars.palette.error.mainChannel} / 0.7)`,
                  '&:hover': {
                    color: `rgba(${theme.vars.palette.error.mainChannel} / 1)`,
                  },
                }}
              />
            </Tooltip>
          )}
          {/* Multiple grades */}
          {!hasInvalidGrade &&
            !isGradeExpired &&
            sourceValue.task.grades.length > 1 && (
              <InfoOutlined
                sx={{
                  position: 'absolute',
                  float: 'left',
                  top: '-5%',
                  left: '1%',
                  width: '15px',
                  color: `rgba(${theme.vars.palette.info.mainChannel} / 0.3)`,
                }}
              />
            )}

          {bestGrade?.date && (
            <Typography
              sx={{
                position: 'absolute',
                float: 'right',
                bottom: '-1%',
                right: '1%',
                textAlign: 'right',
                fontSize: '0.7rem',
                color: `rgba(${theme.vars.palette.primary.mainChannel} / 0.7)`,
              }}
            >
              {bestGrade.date.toLocaleDateString()}
            </Typography>
          )}

          {sourceValue.task.grades.length > 0 && bestGrade === null && (
            <Tooltip
              placement="top"
              title={t('course.results.all-grades-expired')}
            >
              <EventBusyOutlined
                sx={{
                  position: 'absolute',
                  float: 'left',
                  top: '-5%',
                  left: '1%',
                  width: '15px',
                  color: `rgba(${theme.vars.palette.error.mainChannel} / 0.7)`,
                  '&:hover': {
                    color: `rgba(${theme.vars.palette.error.mainChannel} / 1)`,
                  },
                }}
              />
            </Tooltip>
          )}
        </>
      )}
    </Box>
  );
};

export default GradeCell;
