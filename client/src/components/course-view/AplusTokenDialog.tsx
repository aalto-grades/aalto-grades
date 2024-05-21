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
} from '@mui/material';

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const AplusTokenDialog = ({handleClose, open}: PropsType): JSX.Element => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ API token</DialogTitle>
      <DialogContent>
        <p>
          You can find your API token by logging in to A+ and navigating to:{' '}
          <Link href="https://plus.cs.aalto.fi/accounts/accounts/">
            https://plus.cs.aalto.fi/accounts/accounts/
          </Link>
        </p>
        <TextField sx={{mt: 1, width: 1}} label="API Token" required={true} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AplusTokenDialog;
