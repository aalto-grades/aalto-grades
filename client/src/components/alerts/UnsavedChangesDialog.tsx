// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogActions,
  DialogContent, Stack, Typography
} from '@mui/material';

function UnsavedChangesDialog(props: {
  setOpen: (open: boolean) => void,
  open: boolean,
  navigateDir: string
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <Dialog
      open={props.open}
      onClose={(): void => props.setOpen(false)}
      scroll='paper'
      aria-labelledby="unsaved-changes"
      aria-describedby="dialog-for-unsaved-changes"
    >
      <Box sx={{ p: 2 }}>
        <DialogContent>
          <Typography variant='h2' sx={{ mb: 2 }}>
            Unsaved Changes
          </Typography>
            The form has unsaved changes. Data you have entered will not be saved.
        </DialogContent>
        <DialogActions>
          <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
            <Button
              size='large'
              variant='outlined'
              onClick={(): void => props.setOpen(false)}
            >
              Stay on this page
            </Button>
            <Button
              size='large'
              variant='contained'
              type='submit'
              onClick={(): void => navigate(props.navigateDir)}
            >
              Discard changes
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

UnsavedChangesDialog.propTypes = {
  setOpen: PropTypes.func,
  open: PropTypes.bool,
  navigateDir: PropTypes.string
};

export default UnsavedChangesDialog;
