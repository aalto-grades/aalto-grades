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
import {JSX, useState} from 'react';

import {getAplusToken, setAplusToken} from '../../utils/utils';

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
  const currentToken = getAplusToken();
  const [token, setToken] = useState<string>('');

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
        {currentToken && (
          <>
            <Typography sx={{mt: 1}}>
              Your current token: {currentToken}
            </Typography>
          </>
        )}
        <TextField
          sx={{my: 2, width: 1}}
          label="API Token"
          value={token}
          onChange={e => setToken(e.target.value)}
          required={true}
        />
        {error && (
          <Typography sx={{color: 'red'}}>
            The A+ token you have entered is invalid, please make sure your
            token is correct.
          </Typography>
        )}
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
