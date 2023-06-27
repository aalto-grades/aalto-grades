// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AssessmentModelsList from './AssessmentModelsList';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import { AssessmentModelData, CourseData, UserData } from 'aalto-grades-common/types';

function CourseDetails(props: {
  course: CourseData,
  assessmentModels: Array<AssessmentModelData>,
  currentAssessmentModelId: number,
  onChangeAssessmentModel: (assessmentModel: AssessmentModelData) => void
}) {
  return (
    <Box sx={{ display: 'inline-block', pt: 1.5 }}>
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', columnGap: 4, pb: 1
      }}>
        <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >
          Course Details
        </Typography>
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{
        bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '318px'
      }}>
        <LightLabelBoldValue
          label='Credits'
          value={props.course.minCredits === props.course.maxCredits
            ? props.course.minCredits
            : `${props.course.minCredits}-${props.course.maxCredits}`
          }
        />
        <LightLabelBoldValue
          label='Organizer'
          value={props.course.department.en}
        />
        <LightLabelBoldValue
          label='Educational Institution'
          // REPLACE SOME DAY? currently this info can't be fetched from database
          value='Aalto University'
        />
      </Box>
      <Box sx={{ m: 1.5 }}>
        <Typography variant='h3' align='left' sx={{ pt: 1.5, pb: 1 }}>
          Teachers in Charge
        </Typography>
        {
          props.course.teachersInCharge.map((teacher: UserData) => {
            return (
              <Typography align='left' key={teacher.id} >
                {teacher.name}
              </Typography>
            );
          })
        }
      </Box>
      <Box sx={{ m: 1.5 }}>
        <Typography variant='h3' align='left' sx={{ pt: 1.5, pb: 1 }}>
          Assessment Models
        </Typography>
        <AssessmentModelsList
          data={props.assessmentModels}
          current={props.currentAssessmentModelId}
          onClick={props.onChangeAssessmentModel}
        />
      </Box>
    </Box>
  );
}

CourseDetails.propTypes = {
  course: PropTypes.object,
  assessmentModels: PropTypes.array,
  currentAssessmentModelId: PropTypes.number,
  onChangeAssessmentModel: PropTypes.func
};

export default CourseDetails;
