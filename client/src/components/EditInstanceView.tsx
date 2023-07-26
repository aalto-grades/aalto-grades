// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseData, CourseInstanceData, GradingScale, Period
} from 'aalto-grades-common/types';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import {
  Box, Button, Container, LinearProgress, MenuItem, TextField, Typography
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { NavigateFunction, useNavigate, Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';
import * as yup from 'yup';

import AlertSnackbar from './alerts/AlertSnackbar';
import UnsavedChangesDialog from './alerts/UnsavedChangesDialog';

import {
  useAddInstance, UseAddInstanceResult, useGetCourse, useGetSisuInstance
} from '../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../hooks/useSnackPackAlerts';
import { convertToClientGradingScale, formatSisuCourseType } from '../services/textFormat';
import { State } from '../types';

export default function EditInstanceView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId, sisuInstanceId }: Params =
    useParams() as { courseId: string, sisuInstanceId: string };

  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  const addInstance: UseAddInstanceResult = useAddInstance({
    onSuccess: () => {
      navigate(`/course-view/${courseId}`, { replace: true });
    }
  });

  const course: UseQueryResult<CourseData> = useGetCourse(courseId);
  let sisuInstance: UseQueryResult<CourseInstanceData> | null = null;

  if (sisuInstanceId)
    sisuInstance = useGetSisuInstance(sisuInstanceId);

  async function handleSubmit(values: CourseInstanceData): Promise<void> {
    if (courseId) {
      addInstance.mutate({
        courseId: courseId,
        instance: {
          ...values,
          sisuCourseInstanceId: (
            (sisuInstance && sisuInstance.data)
              ? sisuInstance.data.sisuCourseInstanceId
              : undefined
          )
        }
      });
    }
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <Typography variant="h1" sx={{ flexGrow: 1, mb: 5, textAlign: 'left' }}>
        Create Course Instance
      </Typography>
      {
        (course.data && (sisuInstance === null || !sisuInstance.isLoading)) ?
          <>
            <Typography variant="h3" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
              {course.data.courseCode + ' - ' + course.data.name.en}
            </Typography>
            {sisuInstanceId &&
              <Typography variant="body2" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
                {'Sisu instance ID: ' + sisuInstanceId}
              </Typography>
            }
            <Formik
              initialValues={
                (sisuInstance !== null && sisuInstance.data) ? {
                  type: formatSisuCourseType(sisuInstance.data.type),
                  startDate: sisuInstance.data.startDate,
                  endDate: sisuInstance.data.endDate,
                  startingPeriod: sisuInstance.data.startingPeriod ?? Period.I,
                  endingPeriod: sisuInstance.data.endingPeriod ?? Period.I,
                  gradingScale: sisuInstance.data.gradingScale
                } : {
                  type: '',
                  startDate: new Date(),
                  endDate: new Date(),
                  startingPeriod: Period.I,
                  endingPeriod: Period.I,
                  gradingScale: GradingScale.Numerical
                }
              }
              validationSchema={yup.object({
                type: yup.string()
                  .required(),
                startDate: yup.date()
                  .required(),
                endDate: yup.date()
                  .min(yup.ref('startDate'), 'Ending date must be after starting date.')
                  .required(),
                startingPeriod: yup.string()
                  .oneOf(Object.values(Period))
                  .required(),
                endingPeriod: yup.string()
                  .oneOf(Object.values(Period))
                  .required(),
                gradingScale: yup.string()
                  .oneOf(Object.values(GradingScale))
                  .required()
              })}
              onSubmit={handleSubmit}
            >
              {
                ({ errors, handleChange, isSubmitting, isValid, touched, values, initialValues }:
                  {
                    errors: FormikErrors<CourseInstanceData>,
                    handleChange: (e: ChangeEvent<Element>) => void,
                    isSubmitting: boolean,
                    isValid: boolean,
                    touched: FormikTouched<CourseInstanceData>,
                    values: CourseInstanceData,
                    initialValues: CourseInstanceData
                  }
                ): JSX.Element => (
                  <Form>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      flexDirection: 'column',
                      justifyContent: 'space-around',
                      boxShadow: 2,
                      borderRadius: 2,
                      my: 2,
                      p: 2
                    }}>
                      <TextField
                        id="type"
                        type="text"
                        fullWidth
                        value={values.type}
                        disabled={isSubmitting}
                        label="Type*"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.type
                          ?? 'Type of the course instance, e.g., Teaching or Exam.'
                        }
                        error={touched.type && Boolean(errors.type)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="startDate"
                        type="date"
                        fullWidth
                        value={values.startDate}
                        disabled={isSubmitting}
                        label="Starting Date*"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.startDate
                            ? String(errors.startDate)
                            : 'Starting date of the course instance.'
                        }
                        error={touched.startDate && Boolean(errors.startDate)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="endDate"
                        type="date"
                        fullWidth
                        value={values.endDate}
                        disabled={isSubmitting}
                        label="Ending Date*"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.endDate
                            ? String(errors.endDate)
                            : 'Ending date of the course instance.'
                        }
                        error={touched.endDate && Boolean(errors.endDate)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="startingPeriod"
                        name="startingPeriod"
                        type="text"
                        fullWidth
                        value={values.startingPeriod}
                        disabled={isSubmitting}
                        label="Starting Period*"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.startingPeriod
                          ?? 'Starting period of the course instance.'
                        }
                        error={touched.startingPeriod && Boolean(errors.startingPeriod)}
                        onChange={handleChange}
                        select
                      >
                        {
                          Object.values(Period).map((value: Period) => {
                            return (
                              <MenuItem key={value} value={value}>{value}</MenuItem>
                            );
                          })
                        }
                      </TextField>
                      <TextField
                        id="endingPeriod"
                        name="endingPeriod"
                        type="text"
                        fullWidth
                        value={values.endingPeriod}
                        disabled={isSubmitting}
                        label="Ending Period*"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.endingPeriod
                          ?? 'Ending period of the course instance.'
                        }
                        error={touched.endingPeriod && Boolean(errors.endingPeriod)}
                        onChange={handleChange}
                        select
                      >
                        {
                          Object.values(Period).map((value: Period) => {
                            return (
                              <MenuItem key={value} value={value}>{value}</MenuItem>
                            );
                          })
                        }
                      </TextField>
                      <TextField
                        id="gradingScale"
                        name="gradingScale"
                        type="text"
                        fullWidth
                        value={values.gradingScale}
                        disabled={isSubmitting}
                        label="Grading Scale*"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.gradingScale
                          ?? 'Grading scale of the course instance, e.g., 0-5 or pass/fail.'
                        }
                        error={touched.gradingScale && Boolean(errors.gradingScale)}
                        onChange={handleChange}
                        select
                      >
                        {
                          Object.values(GradingScale).map((value: GradingScale) => {
                            return (
                              <MenuItem key={value} value={value}>
                                {convertToClientGradingScale(value)}
                              </MenuItem>
                            );
                          })
                        }
                      </TextField>
                    </Box>
                    <Box sx={{
                      display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                      alignItems: 'center', pb: 6
                    }}>
                      <Button
                        size='medium'
                        variant='outlined'
                        disabled={isSubmitting}
                        onClick={(): void => {
                          if (initialValues != values) {
                            setShowDialog(true);
                          } else {
                            navigate('/course-view/' + courseId);
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        id='ag_confirm_instance_details_btn'
                        variant='contained'
                        type='submit'
                        disabled={!isValid || isSubmitting}
                      >
                        Confirm Details
                      </Button>
                    </Box>
                  </Form>
                )
              }
            </Formik>
            <UnsavedChangesDialog
              setOpen={setShowDialog}
              open={showDialog}
              navigateDir={'/course-view/' + courseId}
            />
          </>
          : <LinearProgress sx={{ margin: '200px 50px 0px 50px' }} />
      }
      <AlertSnackbar snackPack={snackPack} />
    </Container>
  );
}
