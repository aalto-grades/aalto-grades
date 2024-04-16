// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {MoreVert} from '@mui/icons-material';
import {IconButton, Tooltip} from '@mui/material';
import {JSX, useState} from 'react';
import {GroupedStudentRow} from './CourseResultsTanTable';

type PropsType = {
  row: GroupedStudentRow;
  assessmentModelIds: (number | undefined)[] | undefined;
  onClick: () => void;
};
const PredictedGradeCell = ({
  row,
  assessmentModelIds,
  onClick,
}: PropsType): JSX.Element => {
  const [hover, setHover] = useState<boolean>(false);

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
      <p style={{margin: 0, display: 'inline'}}>
        {row.predictedFinalGrades?.join('/')}
      </p>
      {assessmentModelIds !== undefined &&
        assessmentModelIds.length > 0 &&
        hover && (
          <Tooltip title="View graph" placement="top">
            <IconButton
              sx={{position: 'absolute', right: '0px', top: 'calc(50% - 20px)'}}
              onClick={onClick}
            >
              <MoreVert color="primary" />
            </IconButton>
          </Tooltip>
        )}
    </div>
  );
};

export default PredictedGradeCell;
