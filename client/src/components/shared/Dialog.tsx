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
import type {JSX} from 'react';
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
} & DialogProps;

const Dialog = ({
  open,
  onClose,
  disableCloseButton = false,
  children,
  ...props
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  return (
    <MuiDialog open={open} onClose={onClose} {...props}>
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
