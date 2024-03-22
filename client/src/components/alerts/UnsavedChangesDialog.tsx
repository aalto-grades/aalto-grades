// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {JSX} from 'react';

const UnsavedChangesDialog = ({
  open,
  onClose,
  handleDiscard,
  dontCloseOnDiscard = false,
}: {
  open: boolean;
  onClose: () => void;
  handleDiscard: () => void;
  dontCloseOnDiscard?: boolean;
}): JSX.Element => (
  <Dialog
    open={open}
    onClose={onClose}
    scroll="paper"
    aria-labelledby="unsaved-changes"
    aria-describedby="dialog-for-unsaved-changes"
  >
    <DialogTitle>Unsaved Changes</DialogTitle>
    <DialogContent>
      You have unsaved changes. Data you have entered will not be saved.
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={onClose}>
        Stay on this page
      </Button>
      <Button
        variant="contained"
        type="submit"
        color="error"
        onClick={(): void => {
          handleDiscard();
          if (!dontCloseOnDiscard) onClose();
        }}
      >
        Discard changes
      </Button>
    </DialogActions>
  </Dialog>
);

export default UnsavedChangesDialog;
