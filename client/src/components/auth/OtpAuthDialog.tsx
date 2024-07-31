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
  otpAuth: string | null;
  onClose: () => void;
  closeText?: string;
};
const OtpAuthDialog = ({
  otpAuth,
  onClose,
  closeText = 'Back to login',
}: PropsType): JSX.Element => {
  const [showSecret, setShowSecret] = useState<boolean>(false);

  const secret =
    otpAuth === null ? null : otpAuth.split('secret=')[1].split('&')[0];
  return (
    <Dialog open={otpAuth !== null} onClose={onClose} fullWidth maxWidth="xs">
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
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpAuthDialog;
