// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { ChangeEvent, SyntheticEvent, useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import assessmentModelsService from '../../services/assessmentModels';
import attainmentServices from '../../services/attainments';
import { State } from '../../types';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

function CreateAssessmentModelDialog(props: {
  handleClose: () => void,
  open: boolean,
  onSubmit: () => void
}): JSX.Element {
  const { courseId }: Params = useParams();

  const [name, setName]: State<string> = useState('');
  const [isSubmitting, setIsSubmitting]: State<boolean> = useState(false);

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const assessmentModelId: number = await assessmentModelsService.addAssessmentModel(
        courseId, { name: name }
      );

      await attainmentServices.addAttainment(courseId, assessmentModelId, {
        name: 'Root',
        tag: 'root',
        daysValid: 0
      });

      props.handleClose();
      props.onSubmit();
      setName('');
      setIsSubmitting(false);
    } catch (exception) {
      console.log(exception);
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

export default CreateAssessmentModelDialog;
