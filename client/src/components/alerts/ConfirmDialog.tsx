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
import {IModalProps} from 'react-global-modal';

type ActionButton = {title: string; onClick: () => void};
export const ConfirmDialog = ({
  open,
  title,
  children,
  actions,
  confirmDelete,
}: IModalProps & {confirmDelete: boolean}): JSX.Element => {
  const cancelButton = actions!.find(
    (el: ActionButton) => el.title === 'Cancel'
  ) as ActionButton;
  const confirmButton = actions!.find(
    (el: ActionButton) => el.title === 'Confirm'
  ) as ActionButton;

  const childrenProp = children as {props: {message: string}};
  return (
    <Dialog open={open!} onClose={cancelButton.onClick} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{childrenProp.props.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelButton.onClick}>Cancel</Button>
        <Button
          onClick={confirmButton.onClick}
          variant="contained"
          color={confirmDelete ? 'error' : 'primary'}
        >
          {confirmDelete ? 'Delete' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
