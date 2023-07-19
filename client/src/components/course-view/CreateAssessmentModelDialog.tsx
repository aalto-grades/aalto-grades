// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, TextField
} from '@mui/material';
import PropTypes from 'prop-types';
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
  const [isSubmitting, setIsSubmitting]: State<boolean> = useState(false);

  const addAssessmentModel: UseAddAssessmentModelResult = useAddAssessmentModel({
    onSuccess: (assessmentModelId: number) => {
      if (courseId) {
        addAttainment.mutate({
          courseId: courseId,
          assessmentModelId: assessmentModelId,
          attainment: {
            name: 'Root',
            tag: 'root',
            daysValid: 0
          }
        });
      }
    }
  });

  const addAttainment: UseAddAttainmentResult = useAddAttainment({
    onSuccess: () => {
      props.handleClose();
      props.onSubmit();
      setName('');
      setIsSubmitting(false);
    }
  });

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();

    if (courseId) {
      addAssessmentModel.mutate({
        courseId: courseId,
        assessmentModel: {
          name: name
        }
      });
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
              disabled={isSubmitting}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
            />
            <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
              <Button
                size='large'
                variant='outlined'
                onClick={props.handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size='large'
                variant='contained'
                type='submit'
                disabled={name.length === 0 || isSubmitting}
              >
                Submit
                {isSubmitting && (
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
                )}
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Box>
    </Dialog>
  );
}

CreateAssessmentModelDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  onSubmit: PropTypes.func
};
