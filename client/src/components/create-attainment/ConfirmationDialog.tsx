// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';

// A Dialog component for confirming deletion

function ConfirmationDialog(props: {
  title,
  subject,
  handleClose,
  open,
  deleteAttainment,
  indices,
  attainments
}) {
  return (
    <Dialog open={props.open} >
      <DialogTitle >Delete {props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this {props.subject} and all of the attainments below it?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button size='medium' variant='outlined' onClick={props.handleClose}>
          Cancel
        </Button>
        <Button size='medium' onClick={() => {
          props.deleteAttainment(props.indices, JSON.parse(JSON.stringify(props.attainments)));
          props.handleClose();
        }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  title: PropTypes.string,
  subject: PropTypes.string,
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  deleteAttainment: PropTypes.func,
  attainments: PropTypes.array,
  indices: PropTypes.array
};

export default ConfirmationDialog;
