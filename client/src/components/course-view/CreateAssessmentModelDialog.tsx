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

function CreateAssessmentModelDialog(props: {
  handleClose: () => void,
  open: boolean
}): JSX.Element {
  const { courseId }: Params = useParams();

  const [name, setName]: State<string> = useState('');

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    try {
      const assessmentModelId: number = await assessmentModelsService.addAssessmentModel(
        courseId, { name: name }
      );

      attainmentServices.addAttainment(courseId, assessmentModelId, {
        name: 'Root',
        tag: 'root',
        daysValid: 0
      });

      props.handleClose();
      setName('');
    } catch (exception) {
      console.log(exception);
    }
  }

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle>Create Assessment Model</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              key={'name'}
              id={'name'}
              type='text'
              label={'Name'}
              InputLabelProps={{ shrink: true }}
              margin='normal'
              value={name}
              onChange={
                (event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)
              }
            />
            <Box sx={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            }}>
              <Button
                size='large'
                variant='outlined'
                onClick={props.handleClose}
              >
                Cancel
              </Button>
              <Button
                size='large'
                variant='contained'
                type='submit'
              >
                Submit
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

CreateAssessmentModelDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool
};

export default CreateAssessmentModelDialog;
