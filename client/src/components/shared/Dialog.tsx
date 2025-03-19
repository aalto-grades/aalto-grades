// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  Dialog as MuiDialog,
  Tooltip,
  styled,
} from '@mui/material';
import type {DialogProps} from '@mui/material/Dialog';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

const CloseButton = styled(IconButton)(({theme}) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : '#000',
  },
}));

type PropsType = {
  open: boolean;
  onClose: () => void;
  disableCloseButton?: boolean;
  disableBackdropClick?: boolean;
} & DialogProps;

const Dialog = ({
  open,
  onClose,
  disableCloseButton = false,
  disableBackdropClick = false,
  children,
  ...props
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const [backdropClickCount, setBackdropClickCount] = useState<number>(0);

  const handleClose = (
    _event?: object,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ): void => {
    if (reason === 'backdropClick' && disableBackdropClick) {
      if (backdropClickCount >= 2) {
        setBackdropClickCount(0);
        enqueueSnackbar(t('general.backdrop-dismiss-disabled'), {
          variant: 'warning',
        });
      } else {
        setBackdropClickCount(prev => ++prev);
      }
      return;
    }
    onClose();
  };

  return (
    <MuiDialog open={open} onClose={handleClose} {...props}>
      <Tooltip title={t('general.close-window')} placement="top">
        <CloseButton
          disabled={disableCloseButton}
          onClick={onClose}
          aria-label="close-dialog"
        >
          <CloseIcon />
        </CloseButton>
      </Tooltip>
      <Box sx={{my: 1}}>{children}</Box>
    </MuiDialog>
  );
};

export default Dialog;
