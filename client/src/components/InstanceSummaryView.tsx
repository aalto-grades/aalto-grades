// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AttainmentCategory from './attainments/AttainmentCategory';
import AlertSnackbar from './alerts/AlertSnackbar';
import LightLabelBoldValue from './typography/LightLabelBoldValue';
import textFormatServices from '../services/textFormat';
import instancesService from '../services/instances';
import attainmentServices from '../services/attainments';
import useSnackPackAlerts from '../hooks/useSnackPackAlerts';
import { Message } from '../types/general';
import { CourseInstanceData, GradingScale } from 'aalto-grades-common/types/course';

const successMsgInstance: Message = {
  msg: 'Instance created successfully.',
  severity: 'success'
};

const successMsgWithoutAttainments: Message = {
  msg: 'Instance created successfully. Redirecting to course page in 30 seconds.',
  severity: 'success'
};

const errorMsgInstance: Message = {
  msg: 'Instance creation failed.',
  severity: 'error'
};

const successMsgAttainments: Message = {
  msg: 'Attainments added successfully. Redirecting to course page in 30 seconds.',
  severity: 'success'
};

const errorMsgAttainments: Message = {
  msg: 'Something went wrong while adding attainments.'
    + ' Redirecting to course page in 30 seconds. Attainments can be modified there.',
  severity: 'error'
};

const InstanceSummaryView = () => {
  const navigate = useNavigate();
  const { courseId, sisuInstanceId } = useParams();

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
  } = useOutletContext<any>();

  const [created, setCreated] = useState(false);

  const [
    setInstanceAlert,
    messageInfo, setMessageInfo,
    alertOpen, setAlertOpen
  ] = useSnackPackAlerts();

  const [
    setAttainmentAlert,
    messageInfo2, setMessageInfo2,
    alertOpen2, setAlertOpen2
  ] = useSnackPackAlerts();

  function onGoBack() {
    navigate('/' + courseId + '/add-attainments/' + sisuInstanceId);
  }

  // Helper function
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function onCreateInstance() {

    // attempt to create instance
    try {
      const instanceData: CourseInstanceData = {
        gradingScale: textFormatServices.convertToServerGradingScale(gradingScale) as GradingScale,
        sisuCourseInstanceId: sisuInstanceId,
        type: courseType,
        // fake ! TODO: replace with teachers when figured out how to fetch ids (currently strings)
        teachersInCharge: [1],
        // fake ! TODO: delete from context and here once not required by the server in validation
        startingPeriod: startingPeriod ?? 'I',
        // fake ! TODO: delete from context and here once not required by the server in validation
        endingPeriod: endingPeriod ?? 'III',
        startDate: startDate,
        endDate: endDate
      };
      const courseInstanceId = await instancesService.createInstance(courseId, instanceData);
      setInstanceAlert((prev) => [...prev,
        addedAttainments.length === 0 ? successMsgWithoutAttainments : successMsgInstance]
      );
      setCreated(true);

      // attempt to add all attainments
      if (addedAttainments.length > 0) {
        try {
          const formattedAttainments = attainmentServices.formatStringsToDates(addedAttainments);
          await Promise.all(formattedAttainments.map(async (attainment) => {
            await attainmentServices.addAttainment(
              courseId, courseInstanceId, attainment
            );
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
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5, ml: '7.5vw', mr: '7.5vw' }}>
      <AlertSnackbar
        messageInfo={messageInfo}
        setMessageInfo={setMessageInfo}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      <AlertSnackbar
        position={2}
        messageInfo={messageInfo2}
        setMessageInfo={setMessageInfo2}
        open={alertOpen2}
        setOpen={setAlertOpen2}
      />
      <Typography variant='h1' align='left' sx={{ mb: 4 }}>
        Summary
      </Typography>
      <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >
        Basic Information
      </Typography>
      <Box borderRadius={1} sx={{
        bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block'
      }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <LightLabelBoldValue
            label='Starting Date'
            value={textFormatServices.formatDateString(startDate)}
          />
          <LightLabelBoldValue
            label='Min Credits'
            value={stringMinCredits}
          />
          <LightLabelBoldValue
            label='Ending Date'
            value={textFormatServices.formatDateString(endDate)}
          />
          <LightLabelBoldValue
            label='Max Credits'
            value={stringMaxCredits}
          />
          <LightLabelBoldValue
            label='Type'
            value={courseType}
          />
          <LightLabelBoldValue
            label='Grading Scale'
            value={gradingScale}
          />
        </Box>
      </Box>
      <Box borderRadius={1} sx={{
        bgcolor: 'secondary.light', p: '16px 20px', mb: 5, display: 'inline-block'
      }}>
        <Typography variant='h3' align='left' sx={{ pb: 1 }}>
          Teachers in Charge
        </Typography>
        {
          teachers.map((teacher) => {
            return (
              <Typography align='left' key={teacher} >
                {teacher}
              </Typography>
            );
          })
        }
      </Box>
      <Typography variant='h3' align='left' sx={{ ml: 1.5 }} >
        Added study attainments
      </Typography>
      <Box borderRadius={1} sx={{
        bgcolor: 'primary.light', p: '16px 12px', display: 'inline-block'
      }}>
        {addedAttainments.length !== 0 &&
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'stretch', pb: '8px' }}>
            {
              addedAttainments.map((attainment) => {
                return (
                  <AttainmentCategory
                    key={attainment.temporaryId}
                    attainment={attainment}
                    attainmentKey={'temporaryId'}
                  />
                );
              })
            }
          </Box>
        }
        <Typography variant='body1' color='primary.main' sx={{ m: '8px 0px' }} >
          You can also add study attainments after creating the instance
        </Typography>
      </Box>
      {created ?
        <Button
          variant='contained'
          sx={{ width: 'fit-content', justifySelf: 'center', mb: 6  }}
          onClick={() => navigate('/course-view/' + courseId)} >
          Return to course view
        </Button>
        :
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', pb: 6
        }}>
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
