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

const numberData = {
  fieldId: 'numberData',
  fieldLabel: 'Number of sub-assignments'
};
    
function SimpleDialog({ onClose, open, addSubAssignments }) {

  const [numOfAssignments, setSubs] = useState('0');

  const value = numOfAssignments;
  const error = !(!isNaN(value) && (Number.isInteger(Number(value))) && (Number(value) >= 0));

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      addSubAssignments(numOfAssignments);
    } catch (exception) {
      console.log(exception);
    }
  };

  return (
    <Dialog open={open} >
      <DialogTitle>Create Sub-Assignments</DialogTitle>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          key={numberData.fieldId}
          id={numberData.fieldId}
          type='text'
          label={numberData.fieldLabel}
          InputLabelProps={{ shrink: true }}
          margin='normal'
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]+' }}
          value={value}
          error={error}
          helperText={error ? 'Value needs to be an integer' : ''}
          sx={{ width: '88%' }}
          onChange={({ target }) => setSubs(target.value)}
        />
        <Box sx={{ alignSelf: 'flex-end', m: 2 }}>
          <Button size='medium' sx={{ mr: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button size='medium' variant='outlined' type='submit' onClick={onClose}>
            Confirm
          </Button>
        </Box>
      </form>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  addSubAssignments: PropTypes.func,
};

export default SimpleDialog;
