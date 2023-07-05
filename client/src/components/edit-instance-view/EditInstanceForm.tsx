// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NavigateFunction, Params, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import textFormatServices from '../../services/textFormat';
import { CourseInstanceData, GradingScale, Period } from 'aalto-grades-common/types';

function EditInstanceForm(props: {
  instance: CourseInstanceData,
  addInstance: (instance: CourseInstanceData) => Promise<void>
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId, sisuInstanceId }: Params = useParams();

  return (
    <Formik
      initialValues={{
        type: textFormatServices.formatSisuCourseType(props.instance.type),
        startDate: props.instance.startDate,
        endDate: props.instance.endDate,
        startingPeriod: props.instance.startingPeriod,
        endingPeriod: props.instance.endingPeriod,
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
        ({ errors, handleChange, isSubmitting, isValid, touched, values }) => (
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
                label="Type"
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
                label="Starting Date"
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
                label="Ending Date"
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
                type="text"
                fullWidth
                value={values.startingPeriod}
                disabled={isSubmitting}
                label="Starting Period"
                InputLabelProps={{ shrink: true }}
                margin='normal'
                helperText={
                  errors.startingPeriod
                  ?? 'Starting period of the course instance.'
                }
                error={touched.startingPeriod && Boolean(errors.startingPeriod)}
                onChange={handleChange}
              />
              <TextField
                id="endingPeriod"
                type="text"
                fullWidth
                value={values.endingPeriod}
                disabled={isSubmitting}
                label="Ending Period"
                InputLabelProps={{ shrink: true }}
                margin='normal'
                helperText={
                  errors.endingPeriod
                  ?? 'Ending period of the course instance.'
                }
                error={touched.endingPeriod && Boolean(errors.endingPeriod)}
                onChange={handleChange}
              />
              <TextField
                id="gradingScale"
                type="text"
                fullWidth
                value={values.gradingScale}
                disabled={isSubmitting}
                label="Grading Scale"
                InputLabelProps={{ shrink: true }}
                margin='normal'
                helperText={
                  errors.gradingScale
                  ?? 'Grading scale of the course instance, e.g., 0-5 or pass/fail.'
                }
                error={touched.gradingScale && Boolean(errors.gradingScale)}
                onChange={handleChange}
              />
            </Box>
            <Box sx={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
              alignItems: 'center', pb: 6
            }}>
              <Button
                size='medium'
                variant='outlined'
                onClick={(): void => navigate('/course-view/' + courseId)}
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
  );
}

EditInstanceForm.propTypes = {
  instance: PropTypes.object,
  addInstance: PropTypes.func
};

export default EditInstanceForm;
