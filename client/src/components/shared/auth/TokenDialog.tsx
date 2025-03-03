// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {getToken, setToken} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  error?: boolean;
};

const TokenDialog = ({
  open,
  onClose,
  onSubmit,
  error = false,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const currentToken = getToken();
  const [tokenInput, setTokenInput] = useState<string>('');
  const [showFullToken, setShowFullToken] = useState<boolean>(false);
  const link = 'https://plus.cs.aalto.fi/accounts/accounts/';
  const tokenLength = 40;

  const isError =
    error || (tokenInput.length > 0 && tokenInput.length !== tokenLength);

  const handleClose = (): void => {
    setTokenInput('');
    onClose();
  };

  const handleSubmit = (): void => {
    if (tokenInput) setToken(tokenInput);
    setTokenInput('');
    onSubmit();
  };

  const toggleTokenVisibility = (): void => {
    setShowFullToken(prev => !prev);
  };

  const displayToken = showFullToken
    ? currentToken
    : currentToken?.slice(0, 12) + '...';

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('general.a+-api-token')}</DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {t('shared.auth.token.body')}:{' '}
          <Link href={link} target="_blank">
            {link}
          </Link>
        </Typography>
        {currentToken && (
          <Typography>
            {t('shared.auth.token.current')}:
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  bgcolor: 'primary.light',
                  alignContent: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {displayToken}
              </Box>
              <Button onClick={toggleTokenVisibility} size="small">
                {showFullToken
                  ? t('shared.auth.token.hide-token-tip')
                  : t('shared.auth.token.show-token-tip')}
              </Button>
            </Box>
          </Typography>
        )}
        <TextField
          autoFocus
          sx={{mt: 2, width: 1}}
          label={t('shared.auth.token.label')}
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          required
          error={isError}
          helperText={
            isError
              ? tokenInput.length === 0
                ? t('shared.auth.token.invalid')
                : t('shared.auth.token.length', {
                    length: tokenLength,
                    inputLen: tokenInput.length,
                  })
              : null
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('general.cancel')}</Button>
        <Button
          disabled={!tokenInput || tokenInput.length !== tokenLength}
          variant="contained"
          onClick={handleSubmit}
        >
          {t('general.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenDialog;
