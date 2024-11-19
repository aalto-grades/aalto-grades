// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AccountTreeRounded, Error} from '@mui/icons-material';
import {Box, IconButton, Tooltip} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {GradingScale} from '@/common/types';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {useGetAllGradingModels} from '@/hooks/useApi';
import {getGradeString} from '@/utils';

// If gradingScale is null then value is defined.
type PropsType = {
  row: GroupedStudentRow;
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
  row,
  gradingModelIds,
  onClick,
  gradingScale = null,
  value = null,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const gradingModels = useGetAllGradingModels(courseId);
  const [hover, setHover] = useState<boolean>(false);

  const gradeErrors = row.errors?.filter(
    e =>
      (e.type === 'InvalidPredictedGrade' ||
        e.type === 'OutOfRangePredictedGrade') &&
      gradingModelIds.includes(Number(e.info.modelId))
  );

  let previewValue = 'N/A';
  if (gradingScale === null) previewValue = value ? value.toString() : '0';
  else {
    previewValue = gradingModelIds
      .map(modelId =>
        getGradeString(
          t,
          gradingScale,
          row.predictedGraphValues?.[modelId]?.finalGrade
        )
      )
      .join(' / ');
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
      {gradingModelIds.length > 0 && hover && (
        <Tooltip
          title={t('course.results.view-graph')}
          placement="top"
          disableInteractive
        >
          <IconButton
            sx={{position: 'absolute', right: '0px', top: 'calc(50% - 20px)'}}
            onClick={onClick}
          >
            <AccountTreeRounded color="primary" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default PredictedGradeCell;
