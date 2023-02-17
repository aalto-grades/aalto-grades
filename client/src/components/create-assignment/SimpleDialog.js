// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import subAssignmentServices from '../../services/assignments';

// A Dialog component for asking the number of sub-assignments

const numberData = {
  fieldId: 'numberData',
  fieldLabel: 'Number of sub-assignments'
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
      {subAssignmentServices.getSubAssignments(indices, assignments).length === 0 ?
        <DialogTitle>Create Sub-Assignments</DialogTitle>
        :
        <DialogTitle>Add Sub-Assignments</DialogTitle>}
      <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          sx={{ width: '88%' }}
          onChange={({ target }) => setSubAssignments(target.value)}
        />
        <Box sx={{ alignSelf: 'flex-end', m: 2 }}>
          <Button size='medium' sx={{ mr: 1 }} onClick={handleClose}>
            Cancel
          </Button>
          <Button size='medium' variant='outlined' type='submit' onClick={(event) => {
            if (!error) {
              handleSubmit(event);
            }
          }}>
            Confirm
          </Button>
        </Box>
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
