// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ContentCopy, Done} from '@mui/icons-material';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {UserData} from '@/common/types';
import Dialog from '@/components/shared/Dialog';
import {useResetAuth} from '@/hooks/useApi';

type PropsType = {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
};
const ResetAuthDialog = ({open, onClose, user}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const resetAuth = useResetAuth();
  const [resetPassword, setResetPassword] = useState<boolean>(true);
  const [resetMfa, setResetMfa] = useState<boolean>(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  );
  const [copied, setCopied] = useState<boolean>(false);

  const onReset = async (): Promise<void> => {
    const res = await resetAuth.mutateAsync({
      userId: user!.id,
      resetData: {resetPassword, resetMfa},
    });
    if (resetPassword && resetMfa)
      enqueueSnackbar(t('front-page.auth-reset'), {variant: 'success'});
    else if (resetMfa)
      enqueueSnackbar(t('front-page.mfa-reset'), {variant: 'success'});
    else if (resetPassword)
      enqueueSnackbar(t('shared.auth.password.reset-done'), {
        variant: 'success',
      });

    if (resetPassword) setTemporaryPassword(res.temporaryPassword as string);
    else onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setTemporaryPassword(null);
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{t('front-page.reset-auth')}</DialogTitle>
      <DialogContent>
        {temporaryPassword === null ? (
          <>
            <DialogContentText>
              {t('front-page.resetting-password-for', {user: user?.name})}
            </DialogContentText>
            <FormGroup sx={{mt: 1}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={resetPassword}
                    onClick={() => setResetPassword(oldVal => !oldVal)}
                  />
                }
                label={t('shared.auth.password.reset')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={resetMfa}
                    onClick={() => setResetMfa(oldVal => !oldVal)}
                  />
                }
                label={t('shared.auth.reset-mfa')}
              />
            </FormGroup>
          </>
        ) : (
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography>{t('general.email')}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography>{user?.email}</Typography>
            </Grid>

            <Grid size={6}>
              <Typography>{t('general.name')}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography>{user?.name}</Typography>
            </Grid>

            <Grid size={6}>
              <Typography>{t('front-page.temporary-password')}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography sx={{display: 'inline'}}>
                {temporaryPassword}
              </Typography>
              <Tooltip
                title={t('general.copy')}
                placement="top"
                sx={{my: -1, ml: 1, mr: -2}}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(temporaryPassword);
                    setCopied(true);
                    enqueueSnackbar(t('front-page.password-copied'), {
                      variant: 'success',
                    });
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {!copied ? (
                    <ContentCopy fontSize="small" />
                  ) : (
                    <Done fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {temporaryPassword === null && (
          <Button onClick={onClose}>{t('general.cancel')}</Button>
        )}
        <Button
          variant="contained"
          onClick={() => {
            if (temporaryPassword !== null) {
              onClose();
              setTemporaryPassword(null);
            } else {
              onReset();
            }
          }}
          disabled={!resetPassword && !resetMfa}
        >
          {temporaryPassword === null
            ? t('front-page.reset-auth')
            : t('general.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetAuthDialog;
