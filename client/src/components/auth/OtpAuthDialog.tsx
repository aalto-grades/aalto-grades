// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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
import QRCode from 'react-qr-code';

type PropsType = {
  otpAuth: string | null;
  onClose: () => void;
  closeText?: string;
};
const OtpAuthDialog = ({
  otpAuth,
  onClose,
  closeText = 'Back to login',
}: PropsType): JSX.Element => (
  <Dialog open={otpAuth !== null} onClose={onClose}>
    <DialogTitle>MFA QR code</DialogTitle>
    <DialogContent>
      {otpAuth !== null && <QRCode value={otpAuth} />}
    </DialogContent>
    <DialogActions>
      <Button variant="contained" onClick={onClose}>
        {closeText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default OtpAuthDialog;
