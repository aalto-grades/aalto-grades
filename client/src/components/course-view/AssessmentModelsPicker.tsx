import {Box} from '@mui/material';
import {FC} from 'react';
import AssessmentModelsList from './AssessmentModelsList';
import {CourseData, AssessmentModelData} from 'aalto-grades-common/types';

type AssessmentModelsPickerProps = {
  course: CourseData;
  assessmentModels?: Array<AssessmentModelData>;
  currentAssessmentModelId?: number;
  onChangeAssessmentModel: (assessmentModel: AssessmentModelData) => void;
  onNewAssessmentModel: () => void;
};

const AssessmentModelsPicker: FC<AssessmentModelsPickerProps> = props => {
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
        maxHeight: '200px',
        height: '100%',
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
        <Box sx={{py: 2}}>
          No assessment models found. Please create a new assessment model.
        </Box>
      )}
    </Box>
  );
};

export default AssessmentModelsPicker;
