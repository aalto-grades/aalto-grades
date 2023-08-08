// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, EditGrade, FinalGrade, GradeOption } from 'aalto-grades-common/types';
import {
  Box, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, FormHelperText,
  InputLabel, MenuItem, Select, SelectChangeEvent, Typography
} from '@mui/material';
import { useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import { State } from '../../types';

// A Dialog component for viewing the individual grades of a user.
export default function EditGradeDialog(props: {
  grade?: AttainmentGradeData,
  setOpen: (open: boolean) => void,
  open: boolean
}): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  const [gradeToEdit, setGradeToEdit]: State<GradeOption> =
    useState<GradeOption>(props.grade?.grades[0] as GradeOption);

  /*
export interface EditGrade {
  grade?: number,
  status?: Status,
  date?: Date,
  expiryDate?: Date,
  comment?: string
}
    */


  function testing(id: number): void {
    console.log(props.grade);
    console.log('selected is id', id);
  }

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle>Edit grade data for {props.grade?.attainmentName}:</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>

          {props.grade && (
            <Box sx={{ mb: 2.5 }}>
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
                  <MenuItem key={grade.gradeId} value={grade.gradeId}>{grade.gradeId}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Select grade to edit.</FormHelperText>
            </Box>
          )}
          <Box>
            <Typography variant='h3'>Edit Form</Typography>

          </Box>
        </DialogContent>
        <DialogActions sx={{ pr: 4, py: 3 }}>
          <Button
            size='medium'
            variant='outlined'
            onClick={(): void => {
              props.setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
