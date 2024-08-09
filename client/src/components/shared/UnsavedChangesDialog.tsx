// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Blocker} from 'react-router-dom';

const UnsavedChangesDialog = ({
  blocker,
  handleDiscard,
}: {
  blocker: Blocker | undefined;
  handleDiscard?: () => void;
}): JSX.Element => {
  const {t} = useTranslation();

  const onClose = (): void => {
    if (blocker !== undefined && blocker.state === 'blocked') blocker.reset();
  };

  return (
    <Dialog
      open={blocker !== undefined && blocker.state === 'blocked'}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="unsaved-changes"
      aria-describedby="dialog-for-unsaved-changes"
    >
      <DialogTitle>{t('general.unsaved-changes')}</DialogTitle>
      <DialogContent>{t('alerts.unsaved-changes.body')}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('alerts.unsaved-changes.stay')}
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="error"
          onClick={() => {
            if (handleDiscard !== undefined) handleDiscard();
            if (blocker !== undefined && blocker.state === 'blocked')
              blocker.proceed();
          }}
        >
          {t('alerts.unsaved-changes.discard')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
