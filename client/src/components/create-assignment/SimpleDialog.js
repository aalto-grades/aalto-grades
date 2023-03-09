// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import assignmentServices from '../../services/assignments';

// A Dialog component for asking the number of sub-assignments

const numberData = {
  fieldId: 'numberData',
  fieldLabel: 'Number of sub-attainments'
};
    
function SimpleDialog({ handleClose, open, addSubAssignments, indices, assignments }) {

  const [numOfAssignments, setSubAssignments] = useState('1');

  // The value given should be an integer of one or higher
  const error = !(!isNaN(numOfAssignments) && (Number.isInteger(Number(numOfAssignments))) && (Number(numOfAssignments) >= 1));

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      addSubAssignments(numOfAssignments);
      handleClose();
    } catch (exception) {
      console.log(exception);
    }
  };

  return (
    <Dialog open={open} >
      {assignmentServices.getSubAssignments(indices, assignments).length === 0 ?
        <DialogTitle>Create Sub Study Attainments</DialogTitle>
        :
        <DialogTitle>Add Sub Study Attainments</DialogTitle>}
      <form>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <TextField
            key={numberData.fieldId}
            id={numberData.fieldId}
            type='text'
            label={numberData.fieldLabel}
            InputLabelProps={{ shrink: true }}
            margin='normal'
            inputProps={{ min: 1, maxLength: 2, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={numOfAssignments}
            error={error}
            helperText={error ? 'Value needs to be a positive integer' : ''}
            sx={{ width: '100%' }}
            onChange={({ target }) => setSubAssignments(target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button size='medium' onClick={handleClose}>
            Cancel
          </Button>
          <Button size='medium' variant='outlined' type='submit' onClick={(event) => {
            if (!error) {
              handleSubmit(event);
            }
          }}>
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  addSubAssignments: PropTypes.func,
  assignments: PropTypes.array,
  indices: PropTypes.array
};

export default SimpleDialog;
