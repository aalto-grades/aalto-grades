// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, EditGrade, GradeOption, Status } from 'aalto-grades-common/types';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import {
  Box, Button, Dialog, DialogContent, DialogTitle, InputLabel,
  MenuItem, Select, SelectChangeEvent, TextField, Typography
} from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import * as yup from 'yup';

import AlertSnackbar from '../alerts/AlertSnackbar';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

import { UseEditGradeResult, useEditGrade } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { State } from '../../types';
import { findBestGradeOption } from '../../utils';

// A Dialog component for editing individual grade of a user.
export default function EditGradeDialog(props: {
  grade: AttainmentGradeData,
  handleClose: () => void,
  refetchGrades: () => void,
  open: boolean
}): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const editGrade: UseEditGradeResult = useEditGrade();
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  const [gradeId, setGradeId]: State<number | null> = useState<number | null>(null);

  if (!gradeId && props.open) {
    setGradeId(findBestGradeOption(props.grade.grades)?.gradeId ?? null);
  }

  const [formInitialValues, setFormInitialValues]: State<EditGrade> = useState<EditGrade>({
    grade: 0,
    status: Status.Pending,
    date: new Date(),
    expiryDate: new Date(),
    comment: ''
  });

  async function handleSubmit(values: EditGrade): Promise<void> {
    if (courseId && assessmentModelId && gradeId) {
      editGrade.mutate(
        {
          courseId,
          assessmentModelId,
          gradeId,
          userId: props.grade.userId as number,
          data: values
        },
        {
          onSuccess: () => {
            snackPack.push({
              msg: 'Grade updated successfully.',
              severity: 'success'
            });
            props.handleClose();
            props.refetchGrades();
            setGradeId(null);
          }
        }
      );
    }
  }

  useEffect(() => {
    if (gradeId) {
      const toForm: GradeOption = props.grade.grades.find(
        (grade: GradeOption) => grade.gradeId == gradeId
      ) as GradeOption;

      setFormInitialValues({
        grade: toForm.grade,
        status: toForm.status,
        date: toForm.date,
        expiryDate: toForm.expiryDate,
        comment: toForm.comment
      });
    }
  }, [gradeId]);

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle>Edit grade data for {props.grade.attainmentName}:</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Box sx={{ mb: 2.5 }}>
            <InputLabel id="grade-select-helper-label">
              Select grade for editing
            </InputLabel>
            <Select
              labelId="assessmentModelSelect"
              id="assessmentModelSelectId"
              value={gradeId ? String(gradeId) : ''}
              label="Assessment model"
              fullWidth
              onChange={(event: SelectChangeEvent): void => {
                setGradeId(Number(event.target.value));
              }}
            >
              {props.grade.grades.map((grade: GradeOption) => (
                <MenuItem key={grade.gradeId} value={grade.gradeId}>
                  {grade.gradeId}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography variant='h3'>Edit Form</Typography>
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
                      name="grade"
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
                      name="status"
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
                      name="date"
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
                      name="expiryDate"
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
                      name="comment"
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
                            props.handleClose();
                            setGradeId(null);
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
          </Box>
        </DialogContent>
      </Dialog>
      <UnsavedChangesDialog
        setOpen={setShowDialog}
        open={showDialog}
        handleDiscard={(): void => {
          props.handleClose();
          setGradeId(null);
        }}
      />
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}
