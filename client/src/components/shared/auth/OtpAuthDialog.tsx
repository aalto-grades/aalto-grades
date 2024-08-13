// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {MuiOtpInput} from 'mui-one-time-password-input';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import QRCode from 'react-qr-code';

const splitString = (str: string | null, chunkSize: number): string => {
  if (str === null) return '';

  const chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks.join('\n');
};

type PropsType = {
  open: boolean;
  otpAuth: string | null;
  cancelText?: string;
  onCancel: () => void;
  onSubmit: (otp: string) => Promise<boolean>;
};
const OtpAuthDialog = ({
  open,
  otpAuth,
  cancelText = undefined,
  onCancel,
  onSubmit,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');

  const secret =
    otpAuth === null ? null : otpAuth.split('secret=')[1].split('&')[0];

  return (
    <Dialog open={open} fullWidth maxWidth="xs" disableRestoreFocus>
      <DialogTitle>{t('shared.auth.otp-auth.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{textAlign: 'center'}}>
          {t('shared.auth.otp-auth.scan')}
        </DialogContentText>
        {otpAuth !== null && (
          <Box sx={{my: 2}} style={{display: 'flex', justifyContent: 'center'}}>
            <QRCode value={otpAuth} />
          </Box>
        )}

        <Box style={{display: 'flex', justifyContent: 'center'}}>
          <Button onClick={() => setShowSecret(oldVal => !oldVal)}>
            {t('shared.auth.otp-auth.manual')}
          </Button>
        </Box>
        <Collapse in={showSecret}>
          <DialogContentText
            data-testid="mfa-secret"
            sx={{mt: 1, textAlign: 'center'}}
          >
            {splitString(secret, 26)}
          </DialogContentText>
        </Collapse>
        <DialogContentText sx={{mt: 2, textAlign: 'center'}}>
          {t('shared.auth.enter-totp')}
        </DialogContentText>
        <MuiOtpInput
          data-testid="mfa-input"
          title="Mfa code"
          sx={{my: 1}}
          length={6}
          value={otp}
          autoFocus
          onChange={newOtp => setOtp(newOtp)}
          validateChar={(c: string) => /\d/.test(c)}
          onComplete={async fullOtp => {
            const res = await onSubmit(fullOtp);
            if (res) setOtp('');
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => {
            onCancel();
            setOtp('');
          }}
        >
          {cancelText ?? t('shared.auth.otp-auth.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            const res = await onSubmit(otp);
            if (res) setOtp('');
          }}
          disabled={otp.length !== 6}
        >
          {t('general.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpAuthDialog;
