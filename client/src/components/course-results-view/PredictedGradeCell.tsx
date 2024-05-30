// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AccountTreeRounded} from '@mui/icons-material';
import {IconButton, Tooltip} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {GradingScale} from '@/common/types';
import {GroupedStudentRow} from '../../context/GradesTableProvider';
import {useGetAllAssessmentModels} from '../../hooks/useApi';
import {getGradeString} from '../../utils/textFormat';

type PropsType = {
  row: GroupedStudentRow;
  assessmentModelIds: number[] | undefined;
  onClick: () => void;
  gradingScale: GradingScale;
};
const PredictedGradeCell = ({
  row,
  assessmentModelIds,
  onClick,
  gradingScale,
}: PropsType): JSX.Element => {
  const [hover, setHover] = useState<boolean>(false);
  const {courseId} = useParams() as {courseId: string};
  const assessmentModels = useGetAllAssessmentModels(courseId);

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
      <Tooltip
        title={
          assessmentModelIds !== undefined && assessmentModelIds.length > 1
            ? `${assessmentModels.data
                ?.filter(model => assessmentModelIds.includes(model.id))
                .map(model => model.name)
                .join(' / ')}`
            : undefined
        }
        placement="top"
        disableInteractive
      >
        <p style={{margin: 0, display: 'inline'}}>
          {assessmentModelIds
            ?.map(modelId =>
              getGradeString(
                gradingScale,
                row.predictedFinalGrades?.[modelId]?.finalGrade
              )
            )
            .join(' / ') || 'N/A'}
        </p>
      </Tooltip>
      {assessmentModelIds !== undefined &&
        assessmentModelIds.length > 0 &&
        hover && (
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
