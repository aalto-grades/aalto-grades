// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, EditGrade, GradeOption, Status } from 'aalto-grades-common/types';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, FormHelperText,
  InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import * as yup from 'yup';

import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

import { State } from '../../types';

// A Dialog component for viewing the individual grades of a user.
export default function EditGradeDialog(props: {
  grade?: AttainmentGradeData,
  setOpen: (open: boolean) => void,
  open: boolean
}): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  /*
  const [gradeToEdit, setGradeToEdit]: State<GradeOption> =
    useState<GradeOption>(props.grade?.grades[0] as GradeOption);
  */

  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  const [initialValues, setInitialValues]: State<EditGrade | null> =
    useState<EditGrade | null>(null);

  if (!initialValues && props.grade?.grades.length !== 0) {
    setInitialValues({
      grade: props.grade?.grades[0].grade,
      status: props.grade?.grades[0].status,
      date: props.grade?.grades[0].date,
      expiryDate: props.grade?.grades[0].expiryDate,
      comment: '-'
    });
  }

  /*
export interface EditGrade {
  grade?: number,
  status?: Status,
  date?: Date,
  expiryDate?: Date,
  comment?: string
}
                  grade: props.grade?.grades[0].grade,
                  status: props.grade?.grades[0].status,
                  date: props.grade?.grades[0].date,
                  expiryDate: props.grade?.grades[0].expiryDate,
                  comment: -
    */


  function testing(id: number): void {
    console.log(props.grade);
    console.log('selected is id', id);
  }

  async function handleSubmit(values: EditGrade): Promise<void> {
    if (courseId && assessmentModelId) {

      console.log('submitted', values);
      /*
      addInstance.mutate(
        {
          courseId: courseId,
          instance: {
            ...values,
            sisuCourseInstanceId: (
              (sisuInstance && sisuInstance.data)
                ? sisuInstance.data.sisuCourseInstanceId
                : undefined
            )
          }
        },
        {
          onSuccess: () => {
            console.log('jeejeeee');
          }
        }
      );
      */
    }
  }

  //{grade.expiryDate && `- expiry date: ${grade.expiryDate.toISOString()}`}


  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle>Edit grade data for {props.grade?.attainmentName}:</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          {(props.grade && props.grade?.grades.length > 1) && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ mb: 1 }}>
                Attainment has multiple grades, select grade for editing.
              </Box>
              <InputLabel id="assessment-model-select-helper-label">Select grade</InputLabel>
              <Select
                labelId="assessmentModelSelect"
                id="assessmentModelSelectId"
                value={String(props.grade.grades[0].gradeId)}
                label="Assessment model"
                fullWidth
                onChange={(event: SelectChangeEvent): void => {
                  testing(Number(event.target.value));
                }}
              >
                {props.grade.grades.map((grade: GradeOption) => (
                  <MenuItem key={grade.gradeId} value={grade.gradeId}>
                    {grade.gradeId}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select grade to edit.</FormHelperText>
            </Box>
          )}
          <Box>
            {
              (props.grade && props.grade?.grades.length > 1) &&
              <Typography variant='h3'>Edit Form</Typography>
            }
            {(initialValues) ? (
              <Formik
                initialValues={initialValues}
                validationSchema={yup.object({
                  grade: yup.number().min(0).notRequired(),
                  status: yup.string().oneOf(Object.values(Status)).notRequired(),
                  date: yup.date().notRequired(),
                  expiryDate: yup.date().notRequired(),
                  comment: yup.string().min(1).notRequired()
                })}
                onSubmit={handleSubmit}
              >
                {
                  ({ errors, handleChange, isSubmitting, isValid, touched, values, initialValues }:
                  {
                    errors: FormikErrors<EditGrade>,
                    handleChange: (e: ChangeEvent<Element>) => void,
                    isSubmitting: boolean,
                    isValid: boolean,
                    touched: FormikTouched<EditGrade>,
                    values: EditGrade,
                    initialValues: EditGrade
                  }
                  ): JSX.Element => (
                    <Form>
                      <TextField
                        id="grade"
                        type="text"
                        fullWidth
                        value={values.grade}
                        disabled={isSubmitting}
                        label="Grade"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.grade
                          ?? 'The numerical grade of a student for an attainment.'
                        }
                        error={touched.grade && Boolean(errors.grade)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="status"
                        type="text"
                        fullWidth
                        value={values.status}
                        disabled={isSubmitting}
                        label="Status"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.status
                            ? String(errors.status)
                            : 'Grading status indicator.'
                        }
                        error={touched.status && Boolean(errors.status)}
                        onChange={handleChange}
                        select
                      >
                        {
                          Object.values(Status).map((value: Status) => {
                            return (
                              <MenuItem key={value} value={value}>{value}</MenuItem>
                            );
                          })
                        }
                      </TextField>
                      <TextField
                        id="date"
                        type="date"
                        fullWidth
                        value={values.date}
                        disabled={isSubmitting}
                        label="Grade Date"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.date
                            ? String(errors.date)
                            : 'Date when attainment is completed (e.g., deadline or exam date)'
                        }
                        error={touched.date && Boolean(errors.date)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="expiryDate"
                        type="date"
                        fullWidth
                        value={values.expiryDate}
                        disabled={isSubmitting}
                        label="Grade Expiry date"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.expiryDate
                            ? String(errors.expiryDate)
                            : 'Date when the grade expires.'
                        }
                        error={touched.expiryDate && Boolean(errors.expiryDate)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="comment"
                        type="text"
                        fullWidth
                        value={values.comment}
                        disabled={isSubmitting}
                        label="comment"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.comment
                            ? String(errors.comment)
                            : 'Comment for grade.'
                        }
                        error={touched.comment && Boolean(errors.comment)}
                        onChange={handleChange}
                      />
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 2,
                        pb: 3
                      }}>
                        <Button
                          size='medium'
                          variant='outlined'
                          color={initialValues != values ? 'error' : 'primary'}
                          disabled={isSubmitting}
                          onClick={(): void => {
                            if (initialValues != values) {
                              setShowDialog(true);
                            } else {
                              props.setOpen(false);
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
                          Submit
                        </Button>
                      </Box>
                    </Form>
                  )
                }
              </Formik>
            ) : (
              <>Something went wrong</>
            )}
          </Box>
        </DialogContent>
      </Dialog>
      <UnsavedChangesDialog
        setOpen={setShowDialog}
        open={showDialog}
        handleDiscard={(): void => props.setOpen(false)}
      />
    </>
  );
}
