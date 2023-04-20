// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import textFormatServices from '../../services/textFormat';

const InstanceDetails = ({ info }) => {
  const { minCredits, maxCredits, startDate, endDate, type, gradingScale, teachersInCharge, department, institution } = info;

  return(
    <Box sx={{ display: 'inline-block', pt: 1.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 4, pb: 1 }}>
        <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >Instance Details</Typography>
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, minWidth: '318px' }}>
        <LightLabelBoldValue label='Starting Date' value={textFormatServices.formatDateString(startDate)} />
        <LightLabelBoldValue label='Ending Date' value={textFormatServices.formatDateString(endDate)} />
        <LightLabelBoldValue label='Type' value={textFormatServices.formatCourseType(type)} />
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '318px' }}>
        <LightLabelBoldValue label='Min Credits' value={minCredits} />
        <LightLabelBoldValue label='Max Credits' value={maxCredits} />
        <LightLabelBoldValue label='Grading Scale' value={textFormatServices.formatGradingScale(gradingScale)} />
        <LightLabelBoldValue label='Organizer' value={department.en} />
        <LightLabelBoldValue label='Educational Institution' value={institution} />
      </Box>
      <Box sx={{ m: 1.5 }}>
        <Typography variant='h3' align='left' sx={{ pt: 1.5, pb: 1 }}>Teachers in Charge</Typography>
        {teachersInCharge.map( (teacher) => <Typography align='left' key={teacher} >{teacher}</Typography> )}
      </Box>
    </Box>
  );
};

InstanceDetails.propTypes = {
  info: PropTypes.object,
  period: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  credits: PropTypes.number,
  scale: PropTypes.string,
  department: PropTypes.string,
  institution: PropTypes.string,
  teachers: PropTypes.array
};

export default InstanceDetails;