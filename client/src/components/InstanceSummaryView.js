// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
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
import useSnackPackAlerts from '../hooks/useSnackPackAlerts';

const successMsgInstance = { msg: 'Instance created successfully.', severity: 'success' };
const successMsgWithoutAttainments = { msg: 'Instance created successfully. Redirecting to course page in 30 seconds.', severity: 'success' };
const errorMsgInstance = { msg: 'Instance creation failed.', severity: 'error' };

const successMsgAttainments = { msg: 'Attainments added successfully. Redirecting to course page in 30 seconds.', severity: 'success' };
const errorMsgAttainments = { msg: 'Something went wrong while adding attainments. Redirecting to course page in 30 seconds. Attainments can be modified there.', severity: 'error' };

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

  const [created, setCreated] = useState(false);

  const [setInstanceAlert, messageInfo, setMessageInfo, alertOpen, setAlertOpen] = useSnackPackAlerts();
  const [setAttainmentAlert, messageInfo2, setMessageInfo2, alertOpen2, setAlertOpen2] = useSnackPackAlerts();

  const onGoBack = () => {
    navigate('/' + courseId + '/add-attainments/' + sisuInstanceId);
  };

  // Helper function
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const onCreateInstance = async () => {

    // attempt to create instance
    try {
      const instanceObj = { 
        gradingScale: textFormatServices.convertToServerGradingScale(gradingScale),
        sisuCourseInstanceId: sisuInstanceId,
        type: courseType,
        teachersInCharge: [1],                   // fake ! TODO: replace with teachers when figured out how to fetch ids (currently strings)
        startingPeriod: startingPeriod ?? 'I',   // fake ! TODO: delete from context and here once not required by the server in validation
        endingPeriod: endingPeriod ?? 'III',     // fake ! TODO: delete from context and here once not required by the server in validation
        minCredits: stringMinCredits,
        maxCredits: stringMaxCredits,
        startDate: startDate,
        endDate: endDate
      };
      const instanceResponse = await instancesService.createInstance(courseId, instanceObj);
      setInstanceAlert((prev) => [...prev, 
        addedAttainments.length === 0 ? successMsgWithoutAttainments : successMsgInstance]
      );
      setCreated(true);

      // attempt to add all assignments
      if (addedAttainments.length > 0) {
        try {
          const formattedAttainments = assignmentServices.formatStringsToDates(addedAttainments);
          await Promise.all(formattedAttainments.map(async (attainment) => {
            await assignmentServices.addAttainment(courseId, instanceResponse.courseInstance.id, attainment);
          }));
          setAttainmentAlert((prev) => [...prev, successMsgAttainments]);
        } catch (attainmentErr) {
          setAttainmentAlert((prev) => [...prev, errorMsgAttainments]);
        }
      }

      // return to the course page even if error in attainment creation
      await sleep(30000);
      navigate('/course-view/' + courseId);   
    } catch (err) {
      setInstanceAlert((prev) => [...prev, errorMsgInstance]);
    }
  };

  return(
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
      <AlertSnackbar position={2} messageInfo={messageInfo2} setMessageInfo={setMessageInfo2} open={alertOpen2} setOpen={setAlertOpen2} />
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
      { created ?
        <Button 
          variant='contained' 
          sx={{ width: 'fit-content', justifySelf: 'center', mb: 6  }} 
          onClick={() => navigate('/course-view/' + courseId)} >
          Return to course view
        </Button>
        :
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', pb: 6 }}>
          <Button 
            variant='outlined' 
            onClick={() => onGoBack()} 
            disabled={messageInfo?.severity === 'info'} 
          >
            Go back
          </Button>
          <Button 
            id='ag_create_instance_btn' 
            variant='contained' 
            onClick={() => onCreateInstance()} 
            disabled={messageInfo?.severity === 'info'}
          >
            Create instance
          </Button>
        </Box>
      }
    </Box>
  );
};

export default InstanceSummaryView;