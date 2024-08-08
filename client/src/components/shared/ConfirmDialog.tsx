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
import {useTranslation} from 'react-i18next';

type PropsType = IModalProps & {
  confirmNavigate: boolean;
  confirmDelete: boolean;
};
const ConfirmDialog = ({
  open,
  title,
  children,
  actions,
  confirmNavigate,
  confirmDelete,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  type ActionButton = {title: string; onClick: () => void};
  const cancelButton = actions!.find(
    (el: ActionButton) => el.title === t('general.cancel')
  ) as ActionButton;
  const confirmButton = actions!.find(
    (el: ActionButton) => el.title === t('general.confirm')
  ) as ActionButton;

  const childrenProp = children as {props: {message: string}};
  let body = childrenProp.props.message;

  const defaultTitle = 'AsyncConfirmation Modal Title';
  const defaultBody = 'AsynConfirmation Modal message'; // Default body has typo lol
  if (confirmNavigate && title === defaultTitle)
    title = t('general.unsaved-changes');
  if (confirmNavigate && body === defaultBody)
    body = t('alerts.unsaved-changes.body');

  return (
    <Dialog open={open!} onClose={cancelButton.onClick} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelButton.onClick}>
          {confirmNavigate
            ? t('alerts.unsaved-changes.stay')
            : t('general.cancel')}
        </Button>
        <Button
          onClick={confirmButton.onClick}
          variant="contained"
          color={confirmNavigate || confirmDelete ? 'error' : 'primary'}
        >
          {confirmNavigate
            ? t('alerts.unsaved-changes.discard')
            : confirmDelete
              ? t('general.delete')
              : t('general.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
