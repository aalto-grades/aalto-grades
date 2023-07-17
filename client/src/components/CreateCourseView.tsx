// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import AlertSnackbar from './alerts/AlertSnackbar';
import CreateCourseForm from './create-course-view/CreateCourseForm';

import courseServices from '../services/courses';
import { Message, State } from '../types';

function CreateCourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const [alertOpen, setAlertOpen]: State<boolean> = useState(false);
  const [messageInfo, setMessageInfo]: State<Message | null> =
    useState<Message | null>(null);

  async function addCourse(course: CourseData): Promise<void> {
    try {
      const courseId: number = await courseServices.addCourse(course);
      navigate(`/course-view/${courseId}`, { replace: true });
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
    <>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 4 }}>
        Create a New Course
      </Typography>
      <CreateCourseForm addCourse={addCourse}/>
      <AlertSnackbar
        messageInfo={messageInfo} setMessageInfo={setMessageInfo}
        open={alertOpen} setOpen={setAlertOpen}
      />
    </>
  );
}

export default CreateCourseView;
