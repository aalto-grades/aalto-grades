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
import attainmentServices from '../../services/attainments';

// A Dialog component for asking the number of sub-attainments

const numberData = {
  fieldId: 'numberData',
  fieldLabel: 'Number of sub-attainments'
};

function SimpleDialog({ handleClose, open, addSubAttainments, indices, attainments }) {

  const [numOfAttainments, setSubAttainments] = useState<any>('1');

  // The value given should be an integer of one or higher
  const error = !(!isNaN(numOfAttainments) && (Number.isInteger(Number(numOfAttainments))) && (Number(numOfAttainments) >= 1));

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      addSubAttainments(numOfAttainments);
      handleClose();
    } catch (exception) {
      console.log(exception);
    }
  };

  return (
    <Dialog open={open} >
      {attainmentServices.getSubAttainments(indices, attainments).length === 0 ?
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
            value={numOfAttainments}
            error={error}
            helperText={error ? 'Value needs to be a positive integer' : ''}
            sx={{ width: '100%' }}
            onChange={({ target }) => setSubAttainments(target.value)}
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
  addSubAttainments: PropTypes.func,
  attainments: PropTypes.array,
  indices: PropTypes.array
};

export default SimpleDialog;
