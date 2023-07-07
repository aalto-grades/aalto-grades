// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AssessmentModelsList from './AssessmentModelsList';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import { AssessmentModelData, CourseData, SystemRole, UserData } from 'aalto-grades-common/types';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import useAuth, { AuthContextType } from '../../hooks/useAuth';
import Tooltip from '@mui/material/Tooltip';

function CourseDetails(props: {
  course: CourseData,
  assessmentModels: Array<AssessmentModelData>,
  currentAssessmentModelId: number,
  onChangeAssessmentModel: (assessmentModel: AssessmentModelData) => void
}): JSX.Element {
  const { auth, isTeacherInCharge }: AuthContextType = useAuth();

  return (
    <Box sx={{ display: 'inline-block' }}>
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', columnGap: 4, pb: 1
      }}>
        <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >
          Course Details
          { (auth.role == SystemRole.Admin || isTeacherInCharge) &&
          <Tooltip title="Edit course details" placement="right">
            <IconButton sx={{ ml: 1 }} color="primary" aria-label="edit course details">
              <EditIcon />
            </IconButton>
          </Tooltip>
          }
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
      <Box sx={{ mt: 1.5 }}>
        <Typography variant='h3' align='left' sx={{ pt: 1.5, pb: 1 }}>
          Teachers in Charge
          { (auth.role == SystemRole.Admin || isTeacherInCharge) &&
          <Tooltip title="Edit teachers in charge" placement="right">
            <IconButton sx={{ ml: 1 }} color="primary" aria-label="edit teachers in charge">
              <EditIcon />
            </IconButton>
          </Tooltip>
          }
        </Typography>
        <Box textAlign='left' borderRadius={1} sx={{
          bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '318px'
        }}>
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
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant='h3' align='left' sx={{ pt: 1.5, pb: 1 }}>
          Assessment Models
          { (auth.role == SystemRole.Admin || isTeacherInCharge) &&
          <Tooltip title="Edit assessment models" placement="right">
            <IconButton sx={{ ml: 1 }} color="primary" aria-label="edit assessment models">
              <EditIcon />
            </IconButton>
          </Tooltip>
          }
        </Typography>
        <Box textAlign='left' borderRadius={1} sx={{
          bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '318px'
        }}>
          { props.assessmentModels.length !== 0 ?
            <AssessmentModelsList
              data={props.assessmentModels}
              current={props.currentAssessmentModelId}
              onClick={props.onChangeAssessmentModel}
            />
            :
            <Box sx={{ py: 2 }}>
              No assesment models found. Please create a new assessment model.
            </Box>
          }
        </Box>
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
