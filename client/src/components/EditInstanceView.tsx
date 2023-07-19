// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseData, CourseInstanceData, GradingScale, Period
} from 'aalto-grades-common/types';
import { Container, LinearProgress, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { NavigateFunction, useNavigate, Params, useParams } from 'react-router-dom';

import EditInstanceForm from './edit-instance-view/EditInstanceForm';
import AlertSnackbar from './alerts/AlertSnackbar';

import { getCourse } from '../services/courses';
import { createInstance, getSisuInstance } from '../services/instances';
import { Message, State } from '../types';

export default function EditInstanceView(): JSX.Element {
  const { courseId, sisuInstanceId }: Params = useParams();

  const navigate: NavigateFunction = useNavigate();

  const [instance, setInstance]: State<CourseInstanceData | null> =
    useState<CourseInstanceData | null>(null);

  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);

  const [messageInfo, setMessageInfo]: State<Message | null> =
    useState<Message | null>(null);

  useEffect(() => {
    if (sisuInstanceId) {
      getSisuInstance(sisuInstanceId)
        .then((courseInstance: CourseInstanceData) => {
          setInstance(courseInstance);
        })
        .catch((e: Error) => console.log(e.message));
    } else if (courseId) {
      getCourse(courseId)
        .then((course: CourseData) => {
          const newInstance: CourseInstanceData = {
            courseData: course,
            type: '',
            startDate: new Date(),
            endDate: new Date(),
            startingPeriod: Period.I,
            endingPeriod: Period.I,
            gradingScale: GradingScale.Numerical
          };

          setInstance(newInstance);
        })
        .catch((e: Error) => console.log(e.message));
    }
  }, []);

  async function addInstance(instance: CourseInstanceData): Promise<void> {
    try {
      if (courseId) {
        await createInstance(courseId, instance);
        navigate(`/course-view/${courseId}`, { replace: true });
      }
    } catch (error: any) {
      let msg: string | Array<string> = error?.message ?? 'Unknown error';

      if (error?.response?.data?.errors) {
        msg = error.response.data.errors;
      }
      setMessageInfo({ msg, severity: 'error' });
      setAlertOpen(true);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
        Create Course Instance
      </Typography>
      {
        instance && instance.courseData ?
          <>
            <Typography variant="h3" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
              {instance.courseData.courseCode + ' - ' + instance.courseData.name.en}
            </Typography>
            { sisuInstanceId &&
              <Typography variant="body2" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
                {'Sisu instance ID: ' + sisuInstanceId}
              </Typography>
            }
            <EditInstanceForm instance={instance} addInstance={addInstance} />
          </>
          : <LinearProgress sx={{ margin: '200px 50px 0px 50px' }} />
      }
      <AlertSnackbar
        messageInfo={messageInfo} setMessageInfo={setMessageInfo}
        open={alertOpen} setOpen={setAlertOpen}
      />
    </Container>
  );
}
