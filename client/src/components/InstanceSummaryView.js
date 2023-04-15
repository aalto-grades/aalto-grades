// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AssignmentCategory from './assignments/AssignmentCategory';
import AlertSnackbar from './alerts/AlertSnackbar';
import LightLabelBoldValue from './typography/LightLabelBoldValue';
import textFormatServices from '../services/textFormat';
import instancesService from '../services/instances';
import assignmentServices from '../services/assignments'; 

const loadingMsgInstance = { msg: 'Creating instance...', severity: 'info' };
const successMsg = { msg: 'Instance created successfully.', severity: 'success' };
const errorMsgInstance = { msg: 'Instance creation failed.', severity: 'error' };

//const loadingMsgAttainments = { msg: 'Adding attainments to the instance...', severity: 'info' };
const successMsgA = { msg: 'Attainments added, you will be redirected to the course page.', severity: 'success' };
//const errorMsgAttainments = { msg: 'Something went wrong with adding the attainments. In a moment you will be redirected to the instance where you can add attainments.', severity: 'error' };

const InstanceSummaryView = () => {
  let navigate = useNavigate();
  let { courseId, sisuInstanceId } = useParams();

  const { 
    addedAttainments,
    startDate, 
    endDate, 
    courseType, 
    stringMinCredits, 
    stringMaxCredits, 
    gradingScale, 
    teachers,
    startingPeriod,
    endingPeriod 
  } = useOutletContext();

  // state variables handling the alert messages
  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  // useEffect in charge of handling the back-to-back alerts
  // makes the previous disappear before showing the new one
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  const onGoBack = () => {
    navigate('/' + courseId + '/add-attainments/' + sisuInstanceId);
  };

  // Helper function
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const onCreateInstance = async () => {
    setSnackPack((prev) => [...prev, loadingMsgInstance]);

    // 1. create instance
    // 2. loop through assignments and add them to the created instance

    try {
      const instanceObj = { 
        gradingScale: textFormatServices.convertToServerGradingScale(gradingScale),
        sisuCourseInstanceId: sisuInstanceId,
        type: courseType,
        teachersInCharge: [1],                   // fake ! TODO: replace with teachers when figured out how to fetch ids (currently strings)
        startingPeriod: startingPeriod ?? 'I',   // fake ! TODO: replace with just startingPeriod when it's not just null anymore
        endingPeriod: endingPeriod ?? 'III',     // fake ! TODO: replace with just endingPeriod when it's not just null anymore
        minCredits: stringMinCredits,
        maxCredits: stringMaxCredits,
        startDate: startDate,
        endDate: endDate
      };
      const instanceResponse = await instancesService.createInstance(courseId, instanceObj);
      setSnackPack((prev) => [...prev, successMsg]);

      await sleep(4000);

      const formattedAttainments = assignmentServices.formatStringsToDates(addedAttainments);
      await Promise.all(formattedAttainments.map(async (attainment) => {
        const res = await assignmentServices.addAttainment(courseId, instanceResponse.courseInstance.id, attainment);
        console.log(res);
      }));

      setSnackPack((prev) => [...prev, successMsgA]);

      await sleep(3000);
      navigate('/course-view/' + courseId);
    } catch (err) {
      console.log(err);
      setSnackPack((prev) => [...prev, errorMsgInstance]); // TODO: differentiate the error based on which fails
    }
  };

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
      <Typography variant='h1' align='left' sx={{ mb: 4 }}>Summary</Typography>
      <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >Basic Information</Typography>
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
        <Typography variant='h3' align='left' sx={{ pb: 1 }}>Teachers in Charge</Typography>
        { teachers.map((teacher) => <Typography align='left' key={teacher} >{teacher}</Typography> )}
      </Box>
      <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >Added study attainments</Typography>
      <Box borderRadius={1} sx={{ bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block' }}>
        { addedAttainments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            { addedAttainments.map(attainment => <AssignmentCategory key={attainment.temporaryId} attainment={attainment} attainmentKey={'temporaryId'} />) }
          </Box>
        }
        <Typography variant='body1' color='primary.main' sx={{ m: '8px 0px' }} >You can also add study attainments after creating the instance</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
        <Button variant='outlined' onClick={() => onGoBack()} disabled={messageInfo?.severity === 'info'} >Go back</Button>
        <Button variant='contained' onClick={() => onCreateInstance()} disabled={messageInfo?.severity === 'info'}>Create instance</Button>
      </Box>
    </Box>
  );
};

export default InstanceSummaryView;