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

type PropsType = IModalProps & {
  confirmNavigate: boolean;
  confirmDelete: boolean;
};
export const ConfirmDialog = ({
  open,
  title,
  children,
  actions,
  confirmNavigate,
  confirmDelete,
}: PropsType): JSX.Element => {
  type ActionButton = {title: string; onClick: () => void};
  const cancelButton = actions!.find(
    (el: ActionButton) => el.title === 'Cancel'
  ) as ActionButton;
  const confirmButton = actions!.find(
    (el: ActionButton) => el.title === 'Confirm'
  ) as ActionButton;

  const childrenProp = children as {props: {message: string}};
  let body = childrenProp.props.message;

  const defaultTitle = 'AsyncConfirmation Modal Title';
  const defaultBody = 'AsynConfirmation Modal message';
  if (confirmNavigate && title === defaultTitle) title = 'Unsaved changes';
  if (confirmNavigate && body === defaultBody)
    body = 'You have unsaved changes. Data you have entered will not be saved';

  return (
    <Dialog open={open!} onClose={cancelButton.onClick} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelButton.onClick}>
          {confirmNavigate ? 'Stay on this page' : 'Cancel'}
        </Button>
        <Button
          onClick={confirmButton.onClick}
          variant="contained"
          color={confirmNavigate || confirmDelete ? 'error' : 'primary'}
        >
          {confirmNavigate
            ? 'Discard changes'
            : confirmDelete
              ? 'Delete'
              : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
