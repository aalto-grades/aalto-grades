// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData} from '@common/types';
import {
  DriveFileRenameOutlineRounded,
  Edit,
  OnlinePredictionSharp,
} from '@mui/icons-material';
import {IconButton, List, ListItemButton} from '@mui/material';
import React, {JSX} from 'react';
import ModifyAssessmentModelDialog from './ModifyAssessmentModelDialog';

export default function AssessmentModelsList(props: {
  data: Array<AssessmentModelData>;
  current: number;
  onClick: (assessmentModel: AssessmentModelData) => void;
}): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [modelId, setModelId] =
    React.useState<AssessmentModelData['id']>(undefined);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <List
      sx={{
        maxHeight: 140,
        overflow: 'auto',
      }}
    >
      {props.data.map((assessmentModel: AssessmentModelData) => {
        return (
          <div style={{display: 'flex'}}>
            <ListItemButton
              key={assessmentModel.id}
              selected={props.current === assessmentModel.id}
              onClick={(): void => props.onClick(assessmentModel)}
              sx={{borderRadius: 100}}
            >
              {assessmentModel.name}
            </ListItemButton>
            <IconButton
              size="small"
              onClick={() => {
                setModelId(assessmentModel.id);
                setOpen(true);
              }}
            >
              {' '}
              <DriveFileRenameOutlineRounded />
            </IconButton>
          </div>
        );
      })}
      {modelId && open && (
        <ModifyAssessmentModelDialog
          open={open}
          handleClose={handleClose}
          modelId={modelId}
          onSubmit={handleClose}
        />
      )}
    </List>
  );
}
