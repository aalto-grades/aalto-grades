// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import textFormatServices from '../../services/textFormat';
import useAuth from '../../hooks/useAuth';

const mockInstitution = 'Aalto University';

const OngoingInstanceInfo = ({ info }) => {
  const { minCredits, maxCredits, startDate, endDate, courseType, gradingScale, responsibleTeachers, courseData } = info;
  const { auth } = useAuth();

  return(
    <Box sx={{ display: 'inline-block', pt: 1.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 4, pb: 1 }}>
        <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Ongoing Instance</Typography>
        { /* Only admins, teachers and assistants are allowed to see attendees*/
          (auth.role == 'SYSADMIN' || auth.role == 'TEACHER'|| auth.role == 'ASSISTANT') && 
          <Button>See attendees</Button>
        }
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, minWidth: '318px' }}>
        <LightLabelBoldValue label='Starting Date' value={textFormatServices.formatDateToString(startDate)} />
        <LightLabelBoldValue label='Ending Date' value={textFormatServices.formatDateToString(endDate)} />
        <LightLabelBoldValue label='Type' value={courseType} />
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '318px' }}>
        <LightLabelBoldValue label='Min Credits' value={minCredits} />
        <LightLabelBoldValue label='Max Credits' value={maxCredits} />
        <LightLabelBoldValue label='Grading Scale' value={gradingScale} />
        <LightLabelBoldValue label='Organizer' value={courseData.department.en} />
        <LightLabelBoldValue label='Educational Institution' value={mockInstitution} />
      </Box>
      <Box sx={{ m: 1.5 }}>
        <Typography variant='h6' align='left' sx={{ pt: 1.5, pb: 1 }}>Responsible Teachers</Typography>
        {responsibleTeachers.map( (teacher) => <Typography align='left' key={teacher} >{teacher}</Typography> )}
      </Box>
    </Box>
  );
};

OngoingInstanceInfo.propTypes = {
  info: PropTypes.object,
  period: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  credits: PropTypes.number,
  scale: PropTypes.string,
  organizer: PropTypes.string,
  institution: PropTypes.string,
  teachers: PropTypes.array
};

export default OngoingInstanceInfo;