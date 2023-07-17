// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AssessmentModelData } from 'aalto-grades-common/types';
import { List, ListItemButton } from '@mui/material';
import PropTypes from 'prop-types';
import { JSX } from 'react';

export default function AssessmentModelsList(props: {
  data: Array<AssessmentModelData>,
  current: number,
  onClick: (assessmentModel: AssessmentModelData) => void
}): JSX.Element {
  return (
    <List sx={{
      maxHeight: 140,
      overflow: 'auto'
    }}>
      {
        props.data.map((assessmentModel: AssessmentModelData) => {
          return (
            <ListItemButton
              key={assessmentModel.id}
              selected={props.current === assessmentModel.id}
              onClick={(): void => props.onClick(assessmentModel)}
            >
              {assessmentModel.name}
            </ListItemButton>
          );
        })
      }
    </List>
  );
}

AssessmentModelsList.propTypes = {
  data: PropTypes.array,
  current: PropTypes.number,
  onClick: PropTypes.func
};
