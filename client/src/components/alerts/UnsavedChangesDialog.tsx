// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from '@mui/material';
import {JSX} from 'react';

export default function UnsavedChangesDialog(props: {
  setOpen: (open: boolean) => void;
  open: boolean;
  handleDiscard: () => void;
}): JSX.Element {
  return (
    <Dialog
      open={props.open}
      onClose={(): void => props.setOpen(false)}
      scroll="paper"
      aria-labelledby="unsaved-changes"
      aria-describedby="dialog-for-unsaved-changes"
    >
      <Box sx={{p: 2}}>
        <DialogContent>
          <Typography variant="h2" sx={{mb: 2}}>
            Unsaved Changes
          </Typography>
          The form has unsaved changes. Data you have entered will not be saved.
        </DialogContent>
        <DialogActions>
          <Stack spacing={2} direction="row" sx={{mt: 2}}>
            <Button
              size="large"
              variant="outlined"
              onClick={(): void => props.setOpen(false)}
            >
              Stay on this page
            </Button>
            <Button
              size="large"
              variant="contained"
              type="submit"
              color="error"
              onClick={(): void => {
                props.handleDiscard();
                props.setOpen(false);
              }}
            >
              Discard changes
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
