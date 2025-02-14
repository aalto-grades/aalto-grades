// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Visibility, VisibilityOff} from '@mui/icons-material';
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
import {type JSX, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import IconButtonWithTooltip from '@/components/shared/IconButtonWithTooltip';
import {type Token, getToken, setToken} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tokenType: Token;
  error?: boolean;
};

const TOKEN_DETAILS = {
  'a+': {
    length: 40,
    link: 'https://plus.cs.aalto.fi/accounts/accounts/',
  },
  sisu: {
    length: 32,
    link: 'https://3scale.apps.ocp4.aalto.fi/admin/applications',
  },
};

const TokenDialog = ({
  open,
  onClose,
  onSubmit,
  tokenType,
  error = false,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const currentToken = getToken(tokenType);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [showFullToken, setShowFullToken] = useState<boolean>(false);

  const {length, link} = useMemo(() => TOKEN_DETAILS[tokenType], [tokenType]);

  const isError =
    error || (tokenInput.length > 0 && tokenInput.length !== length);

  const handleClose = (): void => {
    setTokenInput('');
    onClose();
  };

  const handleSubmit = (): void => {
    if (tokenInput) setToken(tokenType, tokenInput);
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
      <DialogTitle>
        {tokenType === 'a+'
          ? t('general.a+-api-token')
          : t('general.sisu-api-token')}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {tokenType === 'a+'
            ? t('shared.auth.a+-token.body')
            : t('shared.auth.sisu-token.body')}
          :{' '}
          <Link href={link} target="_blank">
            {link}
          </Link>
        </Typography>
        {currentToken && (
          <Typography>
            {t('shared.auth.token-general.current')}:
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
              <Box
                component="span"
                sx={{
                  bgcolor: 'grey.200',
                  alignContent: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {displayToken}
              </Box>
              <IconButtonWithTooltip
                onClick={toggleTokenVisibility}
                sx={{}}
                title={
                  showFullToken
                    ? t('shared.auth.token-general.hide-token-tip')
                    : t('shared.auth.token-general.show-token-tip')
                }
              >
                {showFullToken ? <VisibilityOff /> : <Visibility />}
              </IconButtonWithTooltip>
            </Box>
          </Typography>
        )}
        <TextField
          autoFocus
          sx={{mt: 2, width: 1}}
          label={t('shared.auth.token-general.label')}
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          required
          error={isError}
          helperText={
            isError
              ? tokenInput.length === 0
                ? t('shared.auth.token-general.invalid')
                : t('shared.auth.token-general.length', {length})
              : null
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('general.cancel')}</Button>
        <Button
          disabled={!tokenInput || tokenInput.length !== length}
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
