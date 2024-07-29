import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {JSX} from 'react';
import QRCode from 'react-qr-code';

type PropsType = {otpAuth: string | null; onClose: () => void};
const MfaDialog = ({otpAuth, onClose}: PropsType): JSX.Element => (
  <Dialog open={otpAuth !== null} onClose={onClose}>
    <DialogTitle>MFA QR code</DialogTitle>
    <DialogContent>
      {otpAuth !== null && <QRCode value={otpAuth} />}
    </DialogContent>
    <DialogActions>
      <Button variant="contained" onClick={onClose}>
        Back to login
      </Button>
    </DialogActions>
  </Dialog>
);

export default MfaDialog;
