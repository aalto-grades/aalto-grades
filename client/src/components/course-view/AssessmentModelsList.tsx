// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { AssessmentModelData } from 'aalto-grades-common/types';

function AssessmentModelsList(props: {
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

export default AssessmentModelsList;
