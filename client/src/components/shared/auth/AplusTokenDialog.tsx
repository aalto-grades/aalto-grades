// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
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

import {getAplusToken, setAplusToken} from '@/utils';

type PropsType = {
  handleClose: () => void;
  handleSubmit: () => void;
  open: boolean;
  error?: boolean;
};

const AplusTokenDialog = ({
  handleClose,
  handleSubmit,
  open,
  error = false,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const currentToken = getAplusToken();
  const [token, setToken] = useState<string>('');

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('general.a+-api-token')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('shared.auth.a+-token.body')}:{' '}
          <Link
            href="https://plus.cs.aalto.fi/accounts/accounts/"
            target="_blank"
          >
            https://plus.cs.aalto.fi/accounts/accounts/
          </Link>
        </Typography>
        {currentToken !== null && (
          <Typography sx={{mt: 1}}>
            {t('shared.auth.a+-token.current')}: {currentToken}
          </Typography>
        )}
        <TextField
          sx={{mt: 2, width: 1}}
          label={t('shared.auth.a+-token.label')}
          value={token}
          onChange={e => setToken(e.target.value)}
          required
          error={
            (error && token.length === 0) ||
            (token.length > 0 && token.length !== 40)
          }
          helperText={
            error && !token
              ? t('shared.auth.a+-token.invalid')
              : token.length > 0 && token.length !== 40
                ? t('shared.auth.a+-token.length')
                : ''
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!token || token.length !== 40}
          variant="contained"
          onClick={() => {
            if (token) setAplusToken(token);
            handleSubmit();
          }}
        >
          {t('general.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AplusTokenDialog;
