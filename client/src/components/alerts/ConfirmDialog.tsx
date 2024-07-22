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
import {IModalProps} from 'react-global-modal';

export const ConfirmDialog = ({
  open,
  onModalClose,
  title,
  children,
  actions,
  confirmDelete,
}: IModalProps & {confirmDelete: boolean}): JSX.Element => (
  <Dialog open={open!} onClose={onModalClose} fullWidth maxWidth="xs">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{children}</DialogContentText>
    </DialogContent>
    <DialogActions>
      {actions!.toReversed().map((el: {title: string; onClick: () => void}) => (
        <Button
          key={el.title}
          onClick={el.onClick}
          variant={el.title === 'Confirm' ? 'contained' : 'text'}
          color={el.title === 'Confirm' && confirmDelete ? 'error' : 'primary'}
        >
          {el.title === 'Confirm' && confirmDelete ? 'Delete' : el.title}
        </Button>
      ))}
    </DialogActions>
  </Dialog>
);
