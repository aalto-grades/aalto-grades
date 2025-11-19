// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import type {Blocker} from 'react-router-dom';

type PropsType = {
  blocker: Blocker | undefined;
  handleDiscard?: () => void;
};
const UnsavedChangesDialog = ({
  blocker,
  handleDiscard,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const onClose = (): void => {
    if (blocker?.state === 'blocked') blocker.reset();
  };

  return (
    <Dialog
      open={blocker?.state === 'blocked'}
      onClose={onClose}
      scroll="paper"
    >
      <DialogTitle>{t('general.unsaved-changes')}</DialogTitle>
      <DialogContent>{t('shared.unsaved-changes.body')}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('shared.unsaved-changes.stay')}
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="error"
          onClick={() => {
            if (handleDiscard !== undefined) handleDiscard();
            if (blocker?.state === 'blocked')
              blocker.proceed();
          }}
        >
          {t('shared.unsaved-changes.discard')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
