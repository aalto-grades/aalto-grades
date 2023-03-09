// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';

// A Dialog component for confirming deletion
   
function ConfirmationDialog({ handleClose, open, removeAssignment, indices, assignments }) {
  return (
    <Dialog open={open} >
      <DialogTitle >Delete Sub-Attainments</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this sub-attainment and all of the attainments below it?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button size='medium' variant='outlined' onClick={handleClose}>
          Cancel
        </Button>
        <Button size='medium' onClick={() => {
          removeAssignment(indices, JSON.parse(JSON.stringify(assignments)));
          handleClose();
        }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  removeAssignment: PropTypes.func,
  assignments: PropTypes.array,
  indices: PropTypes.array
};

export default ConfirmationDialog;
