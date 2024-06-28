// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {JSX} from 'react';

const SaveConfirmDialog = ({
  open,
  onClose,
  onSave,
  text,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  text: string;
}): JSX.Element => (
  <Dialog
    open={open}
    onClose={onClose}
    scroll="paper"
    aria-labelledby="confirm-save"
    aria-describedby="dialog-for-confirming-save"
  >
    <DialogTitle>Confirm save</DialogTitle>
    <DialogContent>
      <DialogContentText>{text}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="contained" type="submit" onClick={onSave}>
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default SaveConfirmDialog;
