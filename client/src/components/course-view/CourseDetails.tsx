// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import { CourseData, UserData } from 'aalto-grades-common/types';

function CourseDetails(params: {
  course: CourseData
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
          value={`${params.course.minCredits}-${params.course.maxCredits}`}
        />
        <LightLabelBoldValue
          label='Organizer'
          value={params.course.department.en}
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
          params.course.teachersInCharge.map((teacher: UserData) => {
            return (
              <Typography align='left' key={teacher.id} >
                {teacher.name}
              </Typography>
            );
          })
        }
      </Box>
    </Box>
  );
}

CourseDetails.propTypes = {
  course: PropTypes.object,
};

export default CourseDetails;
