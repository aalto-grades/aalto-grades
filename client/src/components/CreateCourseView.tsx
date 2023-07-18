// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import { Typography } from '@mui/material';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import AlertSnackbar from './alerts/AlertSnackbar';
import CreateCourseForm from './create-course-view/CreateCourseForm';

import useSnackPackAlerts, { SnackPackAlertState } from '../hooks/useSnackPackAlerts';

//import { addCourse as addCourseApi } from '../services/courses';

export default function CreateCourseView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  async function addCourse(course: CourseData): Promise<void> {
    /*try {
      const courseId: number = await addCourseApi(course);
      navigate(`/course-view/${courseId}`, { replace: true });
    } catch (error: any) {
      let msg: string | Array<string> = error?.message ?? 'Unknown error';

      if (error?.response?.data?.errors) {
        msg = error.response.data.errors;
      }
      snackPack.setMessageInfo({ msg, severity: 'error' });
      snackPack.setAlertOpen(true);
    }*/
  }

  return (
    <>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 4 }}>
        Create a New Course
      </Typography>
      <CreateCourseForm addCourse={addCourse}/>
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}
