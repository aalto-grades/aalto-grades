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

import AlertSnackbar from '../alerts/AlertSnackbar';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

import { UseEditGradeResult, useEditGrade } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { State } from '../../types';

// A Dialog component for editing individual grade of a user.
export default function EditGradeDialog(props: {
  grade: AttainmentGradeData,
  setOpen: (open: boolean) => void,
  open: boolean
}): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const editGrade: UseEditGradeResult = useEditGrade();
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const [gradeId, setGradeId]: State<number> =
    useState<number>(props.grade.grades[0].gradeId as number);
  const [formInitialValues, setFormInitialValues]: State<EditGrade> = useState<EditGrade>({
    grade: props.grade.grades[0].grade,
    status: props.grade.grades[0].status,
    date: props.grade.grades[0].date,
    expiryDate: props.grade.grades[0].expiryDate,
    comment: props.grade.grades[0].comment
  });

  function setToForm(id: number): void {
    const toForm: GradeOption | undefined =
      props.grade.grades.find((grade: GradeOption) => grade.gradeId == id);

    if (toForm) {
      setFormInitialValues({
        grade: toForm.grade,
        status: toForm.status,
        date: toForm.date,
        expiryDate: toForm.expiryDate,
        comment: toForm.comment
      });
      setGradeId(toForm.gradeId as number);
    }
  }

  async function handleSubmit(values: EditGrade): Promise<void> {
    if (courseId && assessmentModelId && gradeId) {
      editGrade.mutate(
        {
          courseId,
          assessmentModelId,
          gradeId,
          userId: props.grade.userId as number,
          data: {
            ...values
          }
        },
        {
          onSuccess: () => {
            snackPack.push({
              msg: 'Grade updated successfully.',
              severity: 'success'
            });
          }
        }
      );
    }
  }

  function closeDialog(): void {
    props.setOpen(false);
  }

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle>Edit grade data for {props.grade.attainmentName}:</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          {(props.grade && props.grade.grades.length > 1) && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ mb: 1 }}>
                Attainment has multiple grades, select grade for editing.
              </Box>
              <InputLabel id="assessment-model-select-helper-label">Select grade</InputLabel>
              <Select
                labelId="assessmentModelSelect"
                id="assessmentModelSelectId"
                value={String(gradeId)}
                label="Assessment model"
                fullWidth
                onChange={(event: SelectChangeEvent): void => {
                  setToForm(Number(event.target.value));
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
              (props.grade && props.grade.grades.length > 1) &&
              <Typography variant='h3'>Edit Form</Typography>
            }
            {(formInitialValues) ? (
              <Formik
                enableReinitialize
                initialValues={formInitialValues}
                validationSchema={yup.object({
                  grade: yup.number().min(0).notRequired(),
                  status: yup.string().oneOf(Object.values(Status)).notRequired(),
                  date: yup.date().notRequired(),
                  expiryDate: yup.date().notRequired(),
                  comment: yup.string().notRequired()
                })}
                onSubmit={handleSubmit}
              >
                {
                  ({ errors, handleChange, isSubmitting, isValid, values, initialValues }:
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
                        error={Boolean(errors.grade)}
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
                        error={Boolean(errors.status)}
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
                        value={new Date(values.date as Date).toISOString().split('T')[0]}
                        disabled={isSubmitting}
                        label="Grade Date"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.date
                            ? String(errors.date)
                            : 'Date when attainment is completed (e.g., deadline or exam date)'
                        }
                        error={Boolean(errors.date)}
                        onChange={handleChange}
                      />
                      <TextField
                        id="expiryDate"
                        type="date"
                        fullWidth
                        value={new Date(values.expiryDate as Date).toISOString().split('T')[0]}
                        disabled={isSubmitting}
                        label="Grade Expiry date"
                        InputLabelProps={{ shrink: true }}
                        margin='normal'
                        helperText={
                          errors.expiryDate
                            ? String(errors.expiryDate)
                            : 'Date when the grade expires.'
                        }
                        error={Boolean(errors.expiryDate)}
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
                        error={Boolean(errors.comment)}
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
                              closeDialog();
                            }
                          }}
                        >
                          Close
                        </Button>
                        <Button
                          id='ag_confirm_instance_details_btn'
                          variant='contained'
                          type='submit'
                          disabled={!isValid || isSubmitting || initialValues == values}
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
        handleDiscard={(): void => closeDialog()}
      />
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}
