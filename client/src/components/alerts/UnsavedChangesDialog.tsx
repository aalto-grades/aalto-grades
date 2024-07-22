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
import {Blocker} from 'react-router-dom';

const UnsavedChangesDialog = ({
  blocker,
  handleDiscard,
}: {
  blocker: Blocker | undefined;
  handleDiscard?: () => void;
}): JSX.Element => {
  const onClose = (): void => {
    if (blocker !== undefined && blocker.state === 'blocked') blocker.reset();
  };

  return (
    <Dialog
      open={blocker !== undefined && blocker.state === 'blocked'}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="unsaved-changes"
      aria-describedby="dialog-for-unsaved-changes"
    >
      <DialogTitle>Unsaved changes</DialogTitle>
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
          onClick={() => {
            if (handleDiscard !== undefined) handleDiscard();
            if (blocker !== undefined && blocker.state === 'blocked')
              blocker.proceed();
          }}
        >
          Discard changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
