// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { JSX } from 'react';

export default function GradeOptionsDialog(props: {
  open: boolean,
  handleClose: () => void
}): JSX.Element {

  return (
    <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
      <DialogTitle>Grade Options</DialogTitle>
      <DialogContent>

      </DialogContent>
      <DialogActions sx={{ pr: 4, pb: 3 }}>
        <Button
          size='medium'
          variant='outlined'
          onClick={props.handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
