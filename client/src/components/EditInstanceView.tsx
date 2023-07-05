// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { NavigateFunction, useNavigate, Params, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import EditInstanceForm from './edit-instance-view/EditInstanceForm';
import AlertSnackbar from './alerts/AlertSnackbar';
import coursesService from '../services/courses';
import instancesService from '../services/instances';
import {
  CourseData, CourseInstanceData, GradingScale, Period
} from 'aalto-grades-common/types/course';
import { Message, State } from '../types';

function EditInstanceView(): JSX.Element {
  const { courseId, sisuInstanceId }: Params = useParams();

  const navigate: NavigateFunction = useNavigate();

  const [instance, setInstance]: State<CourseInstanceData> = useState();
  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);
  const [messageInfo, setMessageInfo]: State<Message | undefined> = useState(undefined);

  useEffect(() => {
    if (sisuInstanceId) {
      instancesService.getSisuInstance(sisuInstanceId)
        .then((courseInstance: CourseInstanceData) => {
          setInstance(courseInstance);
        })
        .catch((e: Error) => console.log(e.message));
    } else {
      coursesService.getCourse(courseId)
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
      await instancesService.createInstance(courseId, instance);
      navigate(`/course-view/${courseId}`, { replace: true });
    } catch (error) {
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

export default EditInstanceView;
