// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
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
import {enqueueSnackbar} from 'notistack';
import {JSX} from 'react';

import {UserData} from '@/common/types';
import {useDeleteUser} from '../../../hooks/useApi';

type PropsType = {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
};
const DeleteUserDialog = ({open, onClose, user}: PropsType): JSX.Element => {
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: number): Promise<void> => {
    await deleteUser.mutateAsync(id);
    enqueueSnackbar('User deleted successfully', {variant: 'success'});
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Delete user</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Do you want to delete this user?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            await handleDelete(user!.id);
            onClose();
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;
