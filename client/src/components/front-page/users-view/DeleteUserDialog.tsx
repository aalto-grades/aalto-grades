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
import {JSX} from 'react';

type PropsType = {
  title: string;
  handleAccept: (id: number) => void;
  handleClose: () => void;
  description: string;
  open: boolean;
  userId: number | null;
};
const DeleteUserDialog = ({
  title,
  description,
  handleAccept,
  handleClose,
  open,
  userId,
}: PropsType): JSX.Element => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {description}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button
        onClick={() => {
          if (userId !== null) handleAccept(userId);
          else console.error('UserId was null');
        }}
        autoFocus
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteUserDialog;
