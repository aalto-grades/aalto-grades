// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData, GradingScale, Period } from 'aalto-grades-common/types';
import { Form, Formik } from 'formik';
import { Button, Box, MenuItem, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import { convertToClientGradingScale, formatSisuCourseType } from '../../services/textFormat';
import { State } from '../../types';

export default function EditInstanceForm(props: {
  instance: CourseInstanceData,
  addInstance: (instance: CourseInstanceData) => Promise<void>
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId }: Params = useParams();
  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  return (
    <>
      <Formik
        initialValues={{
          type: formatSisuCourseType(props.instance.type),
          startDate: props.instance.startDate,
          endDate: props.instance.endDate,
          startingPeriod: props.instance.startingPeriod ?? Period.I,
          endingPeriod: props.instance.endingPeriod ?? Period.I,
          gradingScale: props.instance.gradingScale
        }}
        validationSchema={yup.object({
          type: yup.string()
            .required(),
          startDate: yup.date()
            .required(),
          endDate: yup.date()
            .min(yup.ref('startDate'))
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
        onSubmit={async function (values): Promise<void> {
          const instanceObject: CourseInstanceData = {
            type: values.type,
            startDate: values.startDate,
            endDate: values.endDate,
            startingPeriod: values.startingPeriod,
            endingPeriod: values.endingPeriod,
            gradingScale: values.gradingScale
          };
          await props.addInstance(instanceObject);
        }}
      >
        {
          ({ errors, handleChange, isSubmitting, isValid, touched, values, initialValues }) => (
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
  );
}

EditInstanceForm.propTypes = {
  instance: PropTypes.object,
  addInstance: PropTypes.func
};
