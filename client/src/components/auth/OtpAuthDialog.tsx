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
import QRCode from 'react-qr-code';

const splitString = (str: string | null, chunkSize: number): string => {
  if (str === null) return '';

  const chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
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
  cancelText = 'Cancel',
  onCancel,
  onSubmit,
}: PropsType): JSX.Element => {
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');

  const secret =
    otpAuth === null ? null : otpAuth.split('secret=')[1].split('&')[0];

  return (
    // No onClose on purpose to make accidental closing harder
    <Dialog open={open} fullWidth maxWidth="xs" disableRestoreFocus>
      <DialogTitle>MFA QR code</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{textAlign: 'center'}}>
          Scan the QR code in your MFA application
        </DialogContentText>
        {otpAuth !== null && (
          <Box sx={{my: 2}} style={{display: 'flex', justifyContent: 'center'}}>
            <QRCode value={otpAuth} />
          </Box>
        )}

        <Box style={{display: 'flex', justifyContent: 'center'}}>
          <Button onClick={() => setShowSecret(oldVal => !oldVal)}>
            Or manually enter the secret
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
          Enter otp
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
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            const res = await onSubmit(otp);
            if (res) setOtp('');
          }}
          disabled={otp.length !== 6}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpAuthDialog;
