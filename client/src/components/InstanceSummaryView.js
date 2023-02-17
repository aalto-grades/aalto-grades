// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Assignment from './assignments/Assignment';
import AlertSnackbar from './alerts/AlertSnackbar';
import LightLabelBoldValue from './typography/LightLabelBoldValue';
import textFormatServices from '../services/textFormat';

const loadingMsg = { msg: 'Creating instance...', severity: 'info' };
const successMsg = { msg: 'Instance created, you will be redirected to the course page.', severity: 'success' };
const errorMsg = { msg: 'Instance creation failed.', severity: 'error' };

const InstanceSummaryView = () => {
  let navigate = useNavigate();
  let { courseId, instanceId } = useParams();

  const { 
    addedAssignments,
    startDate, 
    endDate, 
    courseType, 
    stringMinCredits, 
    stringMaxCredits, 
    gradingScale, 
    teachers 
  } = useOutletContext();

  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      console.log('opening');
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      // Close the active one when a new one is added
      console.log('closing');
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const onCreateInstance = async () => {
    setSnackPack((prev) => [...prev, loadingMsg]);
    // TODO: actually create the instance 
    await sleep(2000);
    const success = true;
    // TODO: change the code below to respond to the progress of the creation
    await sleep(1000);
    if (success) {
      setSnackPack((prev) => [...prev, successMsg]);
      await sleep(4000);
      navigate('/course-view/' + courseId);
    } else {
      setSnackPack((prev) => [...prev, errorMsg]);
    }
  };

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
      <Typography variant='h3' sx={{ mb: 4, textAlign: 'left', fontWeight: 'light' }}>Summary</Typography>
      <Typography align='left' sx={{ ml: 1.5 }} >Basic Information</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <LightLabelBoldValue label='Starting Date' value={textFormatServices.formatDateString(startDate)} />
          <LightLabelBoldValue label='Min Credits' value={stringMinCredits} />
          <LightLabelBoldValue label='Ending Date' value={textFormatServices.formatDateString(endDate)} />
          <LightLabelBoldValue label='Max Credits' value={stringMaxCredits} />
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
            {addedAssignments.map(assignment => <Assignment key={assignment.category} assignment={assignment} />)}
          </Box>
        }
        <Typography variant='body2' color='primary.main' sx={{ m: '8px 0px' }} >You can also add assignments after creating the instance</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => { navigate('/' + courseId + '/add-assignments/' + instanceId); }}>Go back</Button>
        <Button variant='contained' onClick={() => onCreateInstance()}>Create instance</Button>
      </Box>
    </Box>
  );
};

export default InstanceSummaryView;