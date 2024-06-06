// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// TODO: Currently unused

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
import {JSX, useState} from 'react';

import {getAplusToken, setAplusToken} from '../../utils/utils';

type PropsType = {
  handleClose: () => void;
  handleSubmit: () => void;
  open: boolean;
};

const AplusTokenDialog = ({
  handleClose,
  handleSubmit,
  open,
}: PropsType): JSX.Element => {
  const [token, setToken] = useState<string | null>(getAplusToken());

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ API token</DialogTitle>
      <DialogContent>
        <Typography>
          You can find your API token by logging in to A+ and navigating to:{' '}
          <Link
            href="https://plus.cs.aalto.fi/accounts/accounts/"
            target="_blank"
          >
            https://plus.cs.aalto.fi/accounts/accounts/
          </Link>
        </Typography>
        <TextField
          sx={{mt: 1, width: 1}}
          label="API Token"
          value={token}
          onChange={e => setToken(e.target.value)}
          required={true}
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
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AplusTokenDialog;
