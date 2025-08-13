// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Button, type ButtonProps, CircularProgress} from '@mui/material';
import type {JSX} from 'react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

const LoadingButton = ({
  disabled,
  loading = false,
  children,
  startIcon,
  ...props
}: LoadingButtonProps): JSX.Element => {
  return (
    <Button
      type="submit"
      color="primary"
      variant="contained"
      disabled={disabled || loading}
      startIcon={
        loading
          ? <CircularProgress color="primary" size={20} thickness={6} />
          : (startIcon ? (startIcon) : undefined)
      }
      {...props}
    >
      {children}
    </Button>
  );
};

export default LoadingButton;
