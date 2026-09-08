// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {AccountTreeRounded, Error} from '@mui/icons-material';
import {Box, Tooltip} from '@mui/material';
import type {Cell} from '@tanstack/react-table';
import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {GradingScale} from '@/common/types';
import IconButtonWithTip from '@/components/shared/IconButtonWithTooltip';
import type {features} from '@/components/shared/table/features';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {useGetAllGradingModels} from '@/hooks/useApi';
import {getGradeString} from '@/utils';

// If gradingScale is null then value is defined.
type PropsType = {
  cell: Cell<typeof features, GroupedStudentRow, GroupedStudentRow>;
  gradingModelIds: number[];
  onClick: () => void;
  gradingScale?: GradingScale | null;
  value?: number | null;
};

/**
 * If gradingScale is set then this is a final grade preview cell, otherwise
 * this is a course part grade preview cell
 */
const PredictedGradeCell = ({
  cell,
  gradingModelIds,
  onClick,
  gradingScale = null,
  value = null,
}: PropsType): ReactNode => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const gradingModels = useGetAllGradingModels(courseId);

  const gradeErrors = cell.row.original.errors?.filter(
    e =>
      (e.type === 'InvalidPredictedGrade'
        || e.type === 'OutOfRangePredictedGrade')
      && gradingModelIds.includes(Number(e.info.modelId))
  );

  let previewValue = 'N/A';
  if (gradingScale === null) previewValue = value ? value.toString() : '-';
  else {
    previewValue = gradingModelIds
      .map(modelId =>
        getGradeString(
          t,
          gradingScale,
          cell.row.original.predictedGraphValues?.[modelId]?.finalGrade
        )
      )
      .join(' / ');
  }

  if (cell.getValue() === undefined) return (null);
  if (cell.getIsPlaceholder()) return (null);
  if (cell.getIsGrouped()) return (<>{previewValue}</>);
  return (
    <div
      className="hoverable-container"
      style={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        position: 'relative',
      }}
    >
      {gradeErrors !== undefined && gradeErrors.length > 0 && (
        <Box sx={{position: 'absolute', top: 0}}>
          <Tooltip
            title={gradeErrors.map(e => e.message).join('\n')}
            placement="top"
            disableInteractive
          >
            <Error sx={{fontSize: '20px'}} color="error" />
          </Tooltip>
        </Box>
      )}
      <Tooltip
        title={
          gradingModelIds.length > 1
            ? gradingModels.data
                ?.filter(model => gradingModelIds.includes(model.id))
                .map(model => model.name)
                .join(' / ')
            : undefined
        }
        placement="top"
        disableInteractive
      >
        <p style={{margin: 0, display: 'inline'}}>{previewValue}</p>
      </Tooltip>
      {gradingModelIds.length > 0 && (
        <IconButtonWithTip
          defaultVisible={false}
          onClick={onClick}
          title={t('course.results.view-graph')}
        >
          <AccountTreeRounded color="primary" />
        </IconButtonWithTip>
      )}
    </div>
  );
};

export default PredictedGradeCell;
