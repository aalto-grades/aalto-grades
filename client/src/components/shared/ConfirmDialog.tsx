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
import type {JSX} from 'react';
import type {IModalProps} from 'react-global-modal';
import {useTranslation} from 'react-i18next';

type PropsType = IModalProps & {
  confirmButtonText?: string | null;
  confirmNavigate: boolean;
  confirmDiscard: boolean;
  confirmDelete: boolean;
};
const ConfirmDialog = ({
  open,
  title,
  children,
  actions,
  confirmButtonText = null,
  confirmNavigate,
  confirmDiscard,
  confirmDelete,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  type ActionButton = {title: string; onClick: () => void};

  const cancelButton = actions!.find(
    (el: ActionButton) => el.title.toLowerCase() === 'cancel'
  ) as ActionButton;

  const confirmButton = actions!.find(
    (el: ActionButton) => el.title.toLowerCase() === 'confirm'
  ) as ActionButton;

  const childrenProp = children as {props: {message: string}};
  let body = childrenProp.props.message;

  const defaultTitle = 'AsyncConfirmation Modal Title';
  const defaultBody = 'AsynConfirmation Modal message'; // Default body has typo lol

  if ((confirmNavigate || confirmDiscard) && title === defaultTitle)
    title = t('general.unsaved-changes');

  if ((confirmNavigate || confirmDiscard) && body === defaultBody)
    body = t('shared.unsaved-changes.body');

  return (
    <Dialog open={open!} onClose={cancelButton.onClick} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelButton.onClick}>
          {confirmNavigate
            ? t('shared.unsaved-changes.stay')
            : t('general.cancel')}
        </Button>
        <Button
          onClick={confirmButton.onClick}
          variant="contained"
          color={confirmNavigate || confirmDelete ? 'error' : 'primary'}
        >
          {confirmButtonText
            ? confirmButtonText
            : confirmNavigate || confirmDiscard
              ? t('shared.unsaved-changes.discard')
              : confirmDelete
                ? t('general.delete')
                : t('general.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
