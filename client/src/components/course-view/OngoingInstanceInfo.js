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

const OngoingInstanceInfo = ({ info }) => {
  const { period, startDate, endDate, type, credits, scale, organizer, institution, teachers } = info;

  return(
    <Box sx={{ display: 'inline-block', pt: 1.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 4, pb: 1 }}>
        <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Ongoing instance</Typography>
        <Button>See attendees</Button>
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, minWidth: '190px' }}>
        <LightLabelBoldValue label='Teaching Period' value={period} />
        <LightLabelBoldValue label='Starting Date' value={textFormatServices.formatDate(startDate)} />
        <LightLabelBoldValue label='Ending Date' value={textFormatServices.formatDate(endDate)} />
        <LightLabelBoldValue label='Type' value={type} />
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '190px' }}>
        <LightLabelBoldValue label='Credits' value={credits} />
        <LightLabelBoldValue label='Grading Scale' value={scale} />
        <LightLabelBoldValue label='Organizer' value={organizer} />
        <LightLabelBoldValue label='Educational Institution' value={institution} />
      </Box>
      <Box sx={{ m: 1.5 }}>
        <Typography variant='h6' align='left' sx={{ pt: 1.5, pb: 1 }}>Responsible Teachers</Typography>
        {teachers.map( (teacher) => <Typography align='left' key={teacher} >{teacher}</Typography> )}
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