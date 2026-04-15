// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography} from '@mui/material';
import {startRegistration} from '@simplewebauthn/browser';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useEffect} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';

import {
  usePasskeyDeleteOwn,
  usePasskeyListOwn,
  usePasskeyRegisterFinish,
  usePasskeyRegisterStart,
} from '@/hooks/useApi';
import {resolvePasskeyProviderName} from '@/utils/passkeyProvider';

type ManagePasskeysDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ManagePasskeysDialog = ({open, onClose}: ManagePasskeysDialogProps): JSX.Element => {
  const {t} = useTranslation();
  const passkeyRegisterStart = usePasskeyRegisterStart();
  const passkeyRegisterFinish = usePasskeyRegisterFinish();
  const passkeyDeleteOwn = usePasskeyDeleteOwn();
  const passkeyListOwn = usePasskeyListOwn({enabled: false});

  useEffect(() => {
    if (open) {
      passkeyListOwn.refetch().catch(() => undefined);
    }
  }, [open, passkeyListOwn]);

  const handleRegisterPasskey = async (): Promise<void> => {
    const start = await passkeyRegisterStart.mutateAsync({});
    const registrationResponse = await startRegistration({
      optionsJSON: start.options as Parameters<typeof startRegistration>[0]['optionsJSON'],
    });
    await passkeyRegisterFinish.mutateAsync({registrationResponse});
    await passkeyListOwn.refetch();
    enqueueSnackbar(t('shared.auth.passkey.registered'), {variant: 'success'});
  };

  const handleDeletePasskey = async (passkeyId: number): Promise<void> => {
    const confirmation = await AsyncConfirmationModal({
      title: t('shared.auth.passkey.delete-title'),
      message: t('shared.auth.passkey.delete-message'),
    });
    if (!confirmation) return;

    await passkeyDeleteOwn.mutateAsync({passkeyId});
    await passkeyListOwn.refetch();
    enqueueSnackbar(t('shared.auth.passkey.deleted'), {variant: 'success'});
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t('shared.auth.passkey.manage-title')}</DialogTitle>
      <DialogContent>
        <Button
          variant="contained"
          onClick={handleRegisterPasskey}
          disabled={passkeyRegisterStart.isPending || passkeyRegisterFinish.isPending}
          sx={{mb: 2}}
        >
          {t('shared.auth.register-passkey')}
        </Button>
        {passkeyListOwn.isLoading && (
          <Typography>{t('shared.auth.passkey.loading')}</Typography>
        )}
        {!passkeyListOwn.isLoading
          && (passkeyListOwn.data?.passkeys.length ?? 0) === 0 && (
          <Typography>{t('shared.auth.passkey.none')}</Typography>
        )}
        <Stack spacing={1} sx={{mt: 1}}>
          {(passkeyListOwn.data?.passkeys ?? []).map(passkey => (
            <Stack
              key={passkey.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{border: 1, borderColor: 'divider', borderRadius: 1, p: 1}}
            >
              <Box>
                <Typography variant="body2" sx={{fontWeight: 600}}>
                  {resolvePasskeyProviderName(passkey.aaguid)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                  {t('shared.auth.passkey.id')}
                  {': '}
                  {passkey.credentialId.slice(0, 16)}
                  ...
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                  {t('shared.auth.passkey.type')}
                  {': '}
                  {passkey.authenticatorAttachment ?? t('shared.auth.passkey.unknown')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>
                  {t('shared.auth.passkey.aaguid')}
                  {': '}
                  {passkey.aaguid}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('shared.auth.passkey.created')}
                  {': '}
                  {new Date(passkey.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Button
                color="error"
                onClick={async () => handleDeletePasskey(passkey.id)}
              >
                {t('shared.auth.passkey.delete')}
              </Button>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('general.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagePasskeysDialog;
