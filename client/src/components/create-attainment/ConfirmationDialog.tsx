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
import { AttainmentData } from 'aalto-grades-common/types';
import Box from '@mui/material/Box';

// A Dialog component for confirming deletion

function ConfirmationDialog(props: {
  deleteAttainment: (attainment: AttainmentData) => void,
  attainment: AttainmentData,
  title: string,
  subject: string,
  handleClose: () => void,
  open: boolean
}): JSX.Element {
  return (
    <Dialog open={props.open}>
      <Box sx={{ p: 2 }}>
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
          <Button size='medium' variant='contained' onClick={(): void => {
            props.deleteAttainment(props.attainment);
            props.handleClose();
          }}>
            Delete
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  deleteAttainment: PropTypes.func,
  attainment: PropTypes.object,
  title: PropTypes.string,
  subject: PropTypes.string,
  handleClose: PropTypes.func,
  open: PropTypes.bool
};

export default ConfirmationDialog;
