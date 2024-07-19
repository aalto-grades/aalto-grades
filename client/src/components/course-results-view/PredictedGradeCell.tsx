// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AccountTreeRounded, Error} from '@mui/icons-material';
import {Box, IconButton, Tooltip} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {GradingScale} from '@/common/types';
import {GroupedStudentRow} from '../../context/GradesTableProvider';
import {useGetAllGradingModels} from '../../hooks/useApi';
import {getGradeString} from '../../utils/textFormat';

type PropsType = {
  row: GroupedStudentRow;
  gradingModelIds: number[] | undefined;
  onClick: () => void;
  gradingScale: GradingScale;
};
const PredictedGradeCell = ({
  row,
  gradingModelIds,
  onClick,
  gradingScale,
}: PropsType): JSX.Element => {
  const [hover, setHover] = useState<boolean>(false);
  const {courseId} = useParams() as {courseId: string};
  const gradingModels = useGetAllGradingModels(courseId);

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
      {row.errors?.some(
        error =>
          error.type === 'InvalidPredictedGrade' &&
          gradingModelIds?.includes(Number(error.info.modelId))
      ) && (
        <Box sx={{position: 'absolute', top: 0}}>
          <Tooltip
            title={
              gradingModelIds?.length === 1
                ? 'Predicted grade is out of range'
                : 'One of the predicted grades is out of range'
            }
            placement="top"
            disableInteractive
          >
            <Error sx={{fontSize: '20px'}} color="error" />
          </Tooltip>
        </Box>
      )}
      <Tooltip
        title={
          gradingModelIds !== undefined && gradingModelIds.length > 1
            ? `${gradingModels.data
                ?.filter(model => gradingModelIds.includes(model.id))
                .map(model => model.name)
                .join(' / ')}`
            : undefined
        }
        placement="top"
        disableInteractive
      >
        <p style={{margin: 0, display: 'inline'}}>
          {gradingModelIds
            ?.map(modelId =>
              getGradeString(
                gradingScale,
                row.predictedFinalGrades?.[modelId]?.finalGrade
              )
            )
            .join(' / ') || 'N/A'}
        </p>
      </Tooltip>
      {gradingModelIds !== undefined && gradingModelIds.length > 0 && hover && (
        <Tooltip title="View graph" placement="top" disableInteractive>
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
