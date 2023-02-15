// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Assignment from './assignments/Assignment';
import LightLabelBoldValue from './typography/LightLabelBoldValue';
import textFormatServices from '../services/textFormat';

const InstanceSummaryView = () => {
  let navigate = useNavigate();
  let { instanceId } = useParams();

  const { 
    addedAssignments,
    startDate, 
    endDate, 
    courseType, 
    minCredits, 
    maxCredits, 
    gradingScale, 
    teachers 
  } = useOutletContext();

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <Typography variant='h3' sx={{ mb: 4, textAlign: 'left', fontWeight: 'light' }}>Summary</Typography>
      <Typography align='left' sx={{ ml: 1.5 }} >Basic Information</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <LightLabelBoldValue label='Starting Date' value={textFormatServices.formatDateToString(startDate)} />
          <LightLabelBoldValue label='Min Credits' value={minCredits} />
          <LightLabelBoldValue label='Ending Date' value={textFormatServices.formatDateToString(endDate)} />
          <LightLabelBoldValue label='Max Credits' value={maxCredits} />
          <LightLabelBoldValue label='Type' value={courseType} />
          <LightLabelBoldValue label='Grading Scale' value={gradingScale} />
        </Box>
      </Box>
      <Box borderRadius={1} sx={{ bgcolor: 'secondary.light', p: '16px 20px', mb: 5, display: 'inline-block' }}>
        <Typography align='left' sx={{ pb: 1, fontSize: '20px' }}>Instance Teachers</Typography>
        {teachers.map((teacher) => <Typography align='left' key={teacher} >{teacher}</Typography> )}
      </Box>
      <Typography align='left' sx={{ ml: 1.5 }} >Added assignments</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        {addedAssignments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            {addedAssignments.map(assignment => <Assignment key={assignment[0].type} assignment={assignment} button={<Button>Edit</Button>} />)}
          </Box>
        }
        <Typography variant='body2' color='primary.main' sx={{ m: '8px 0px' }} >You can also add assignments after creating the instance</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => { navigate('/add-assignments/' + instanceId); }}>Go back</Button>
        <Button variant='contained'>Create instance</Button>
      </Box>
    </Box>
  );
};

export default InstanceSummaryView;