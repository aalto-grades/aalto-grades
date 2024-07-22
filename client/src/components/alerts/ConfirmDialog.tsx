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

  if (confirmNavigate && title === undefined) title = 'Unsaved changes';
  if (confirmNavigate && children === undefined)
    children = (
      <div>
        You have unsaved changes. Data you have entered will not be saved
      </div>
    );
  const childrenProp = children as {props: {message: string}};

  return (
    <Dialog open={open!} onClose={cancelButton.onClick} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{childrenProp.props.message}</DialogContentText>
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
