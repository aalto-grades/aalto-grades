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
  Grid,
  Typography,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useState} from 'react';

import {UserData} from '@/common/types';
import {useResetPassword} from '../../../hooks/useApi';

type PropsType = {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
};
const ResetPasswordDialog = ({open, onClose, user}: PropsType): JSX.Element => {
  const resetPassword = useResetPassword();
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );

  const onReset = async (): Promise<void> => {
    const res = await resetPassword.mutateAsync(user!.id);
    enqueueSnackbar('Password reset successfully', {variant: 'success'});
    setTemporaryPassword(res.temporaryPassword);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setTemporaryPassword(null);
      }}
      fullWidth
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Reset password</DialogTitle>
      <DialogContent>
        {temporaryPassword === null ? (
          <DialogContentText id="alert-dialog-description">
            Resetting password for {user?.name}
          </DialogContentText>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Email</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{user?.email}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography>Name</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{user?.name}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography>Temporary password</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{temporaryPassword}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {temporaryPassword === null && (
          <Button onClick={onClose}>Cancel</Button>
        )}
        <Button
          variant="contained"
          onClick={() => {
            if (temporaryPassword !== null) {
              onClose();
              setTemporaryPassword(null);
            } else {
              onReset();
            }
          }}
        >
          {temporaryPassword === null ? 'Reset password' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;
