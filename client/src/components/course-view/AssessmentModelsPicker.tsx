// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, useTheme} from '@mui/material';
import {FC} from 'react';
import AssessmentModelsList from './AssessmentModelsList';
import {CourseData, AssessmentModelData} from '@common/types';

type AssessmentModelsPickerProps = {
  course: CourseData;
  assessmentModels?: Array<AssessmentModelData>;
  currentAssessmentModelId?: number;
  onChangeAssessmentModel: (assessmentModel: AssessmentModelData) => void;
  onNewAssessmentModel: () => void;
};

const AssessmentModelsPicker: FC<AssessmentModelsPickerProps> = props => {
  const theme = useTheme();
  return (
    <Box
      textAlign="left"
      borderRadius={1}
      sx={{
        bgcolor: 'primary.light',
        borderRadius: 4,
        borderTopRightRadius: 0,
        borderEndEndRadius: 0,
        p: 1.5,
        // mt: 1,
        minWidth: '218px',
        maxHeight: '300px',
        height: '100%',
        position: 'relative',
        '::before': {
          content: '""',
          position: 'absolute',
          bottom: '-40px',
          transform: 'rotate(180deg)',
          right: '0px',
          height: '40px',
          width: '40px',
          borderBottomLeftRadius: '50%',
          // backgroundColor: theme.vars.palette.primary.dark,
          boxShadow: `0 20px 0 0 ${theme.vars.palette.primary.light}`,
        },
      }}
    >
      {props.assessmentModels &&
      props.assessmentModels.length > 0 &&
      props.currentAssessmentModelId ? (
        <AssessmentModelsList
          data={props.assessmentModels}
          current={props.currentAssessmentModelId}
          onClick={props.onChangeAssessmentModel}
        />
      ) : (
        <Box sx={{py: 2}}>Create a new model using the button.</Box>
      )}
    </Box>
  );
};

export default AssessmentModelsPicker;
