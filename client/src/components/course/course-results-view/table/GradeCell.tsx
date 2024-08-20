// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  EventBusyOutlined,
  InfoOutlined,
  MoreVert,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {Box, IconButton, Tooltip, Typography, useTheme} from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import {JSX, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {CoursePartGradesData} from '@/common/types';
import {useTableContext} from '@/context/useTableContext';
import {findBestGrade, gradeIsExpired} from '@/utils/bestGrade';
import EditGradesDialog from './EditGradesDialog';

type GradeCellProps = {
  studentNumber: string;
  coursePartResults?: CoursePartGradesData;
  maxGrade: number | null;
};
const GradeCell = ({
  studentNumber,
  coursePartResults,
  maxGrade,
}: GradeCellProps): JSX.Element => {
  const {t} = useTranslation();
  const {gradeSelectOption} = useTableContext();
  const theme = useTheme();

  const [hover, setHover] = useState<boolean>(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const hasInvalidGrade = useMemo(() => {
    if (maxGrade === null || coursePartResults === undefined) return false;
    return coursePartResults.grades.some(grade => grade.grade > maxGrade);
  }, [coursePartResults, maxGrade]);

  const bestGrade = findBestGrade(coursePartResults?.grades ?? [], {
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
        color: hasInvalidGrade || isGradeExpired ? 'error.main' : 'inherit',
        bgcolor:
          hasInvalidGrade || isGradeExpired
            ? `rgba(${theme.vars.palette.error.mainChannel} / 0.1)`
            : 'inherit',
        borderLeft:
          hasInvalidGrade || isGradeExpired
            ? `1px solid rgba(${theme.vars.palette.error.mainChannel} / 0.3)`
            : 'inherit',
        // borderRight: hasInvalidValue || isGradeExpired
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
      {coursePartResults && hover && (
        <>
          <Tooltip
            placement="top"
            title={
              coursePartResults.grades.length <= 1
                ? t('course.results.edit-grade')
                : t('course.results.multiple-grade')
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
      {coursePartResults && gradeDialogOpen && (
        <EditGradesDialog
          open={gradeDialogOpen}
          onClose={() => setGradeDialogOpen(false)}
          studentNumber={studentNumber}
          coursePartId={coursePartResults.coursePartId}
          maxGrade={maxGrade}
          title={t('course.results.grade-of-for', {
            user: studentNumber,
            part: coursePartResults.coursePartName,
          })}
          grades={coursePartResults.grades}
        />
      )}

      {/* Info/warning icons */}
      {/* Contains invalid grades */}
      {hasInvalidGrade && (
        <>
          <Tooltip placement="top" title={'Invalid grades'}>
            {/* <IconButton
                  size='small'
                  color='error'
                  style={{
                    position: 'relative',
                  }}
                > */}
            <WarningAmberOutlined
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
      {/* Expired grade */}
      {!hasInvalidGrade && isGradeExpired && (
        <>
          <Tooltip
            placement="top"
            title={t('course.results.grade-expired-on', {
              date: bestGrade?.expiryDate.toString(),
            })}
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
      {/* Multiple grades (more performance than showing button) TODO: Better solution */}
      {!hasInvalidGrade &&
        !isGradeExpired &&
        coursePartResults &&
        coursePartResults.grades.length > 1 && (
          <InfoOutlined
            sx={{
              position: 'absolute',
              float: 'left',
              top: '-5%',
              left: '1%',
              width: '15px',
              // transform: 'translate(-50%, -50%)',
              color: `rgba(${theme.vars.palette.info.mainChannel} / 0.3)`,
            }}
          />
        )}

      {bestGrade?.date && (
        // The tooltip has poor performance.
        // <Tooltip
        //   placement="top"
        //   title={`Grade obtained on ${bestGrade.date.toString()}`}
        //   disableInteractive
        // >
        <Typography
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
        </Typography>
        // </Tooltip>
      )}
    </Box>
  );
};

export default GradeCell;