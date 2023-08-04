// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, TextField
} from '@mui/material';
import { ChangeEvent, SyntheticEvent, useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import {
  useAddAssessmentModel, UseAddAssessmentModelResult,
  useAddAttainment, UseAddAttainmentResult
} from '../../hooks/useApi';
import { State } from '../../types';

export default function CreateAssessmentModelDialog(props: {
  handleClose: () => void,
  open: boolean,
  onSubmit: () => void
}): JSX.Element {
  const { courseId }: Params = useParams();

  const [name, setName]: State<string> = useState('');

  const addAssessmentModel: UseAddAssessmentModelResult = useAddAssessmentModel();

  const addAttainment: UseAddAttainmentResult = useAddAttainment({
    onSuccess: () => {
      props.handleClose();
      props.onSubmit();
      setName('');
    }
  });

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();

    if (courseId) {
      addAssessmentModel.mutate(
        {
          courseId: courseId,
          assessmentModel: {
            name: name
          }
        },
        {
          onSuccess: (assessmentModelId: number) => {
            if (courseId) {
              addAttainment.mutate({
                courseId: courseId,
                assessmentModelId: assessmentModelId,
                attainment: {
                  name: 'Root',
                  daysValid: 0
                }
              });
            }
          }
        }
      );
    }
  }

  return (
    <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        p: 2
      }}>
        <DialogTitle>Create Assessment Model</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              key='name'
              id='name'
              type='text'
              label='Name'
              fullWidth
              InputLabelProps={{ shrink: true }}
              margin='normal'
              value={name}
              disabled={addAssessmentModel.isLoading || addAttainment.isLoading}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
            />
            <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
              <Button
                size='large'
                variant='outlined'
                onClick={props.handleClose}
                disabled={addAssessmentModel.isLoading || addAttainment.isLoading}
              >
                Cancel
              </Button>
              <Button
                size='large'
                variant='contained'
                type='submit'
                disabled={
                  name.length === 0 || addAssessmentModel.isLoading || addAttainment.isLoading
                }
              >
                Submit
                {
                  (addAssessmentModel.isLoading || addAttainment.isLoading) && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )
                }
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
