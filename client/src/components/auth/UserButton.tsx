// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useNavigate} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import ChangePasswordDialog from './ChangePasswordDialog';
import OtpAuthDialog from './OtpAuthDialog';
import {useConfirmMfa, useLogOut, useResetOwnAuth} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import AplusTokenDialog from '../shared/AplusTokenDialog';

const UserButton = (): JSX.Element => {
  const navigate = useNavigate();
  const {auth, setAuth} = useAuth();
  const queryClient = useQueryClient();
  const logOut = useLogOut();
  const resetOwnAuth = useResetOwnAuth();
  const confirmMfa = useConfirmMfa();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState<boolean>(false);
  const [showMfaDialog, setShowMfaDialog] = useState<boolean>(false);
  const [otpAuth, setOtpAuth] = useState<string | null>(null);

  const handleLogOut = async (): Promise<void> => {
    await logOut.mutateAsync();
    setAuth(null);
    setAnchorEl(null);
    queryClient.clear();
    navigate('/login');
  };

  const handleResetMfa = async (): Promise<void> => {
    setAnchorEl(null);
    const confirmation = await AsyncConfirmationModal({
      title: 'Reset MFA secret',
      message: 'Are you sure you want to reset your MFA secret',
    });
    if (!confirmation) return;

    const otpAuthRes = await resetOwnAuth.mutateAsync({
      resetPassword: false,
      resetMfa: true,
    });

    setOtpAuth(otpAuthRes.otpAuth as string);
    setShowMfaDialog(true);
  };

  const handleConfirmResetMfa = async (otp: string): Promise<void> => {
    await confirmMfa.mutateAsync({otp});
    setShowMfaDialog(false);
    setOtpAuth(null);
  };

  const menuOpen = Boolean(anchorEl);

  if (auth?.name === undefined) {
    return <div data-testid="not-logged-in"></div>;
  }

  return (
    <>
      <AplusTokenDialog
        handleClose={() => setAplusTokenDialogOpen(false)}
        handleSubmit={() => setAplusTokenDialogOpen(false)}
        open={aplusTokenDialogOpen}
      />
      {auth.role === SystemRole.Admin && (
        <>
          <ChangePasswordDialog
            onClose={() => setChangePasswordDialogOpen(false)}
            open={changePasswordDialogOpen}
          />
          <OtpAuthDialog
            open={showMfaDialog}
            otpAuth={otpAuth}
            cancelText="Close without confirming"
            onCancel={() => {
              setShowMfaDialog(false);
              setOtpAuth(null);
            }}
            onSubmit={async (otp: string) => {
              await handleConfirmResetMfa(otp);
              return true;
            }}
          />
        </>
      )}

      <Button
        id="basic-button"
        color="inherit"
        aria-controls={menuOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={event => {
          setAnchorEl(event.currentTarget);
          setAnchorWidth(event.currentTarget.offsetWidth);
        }}
      >
        <Box sx={{marginRight: 1, marginTop: 1}}>
          <PersonIcon color="inherit" />
        </Box>
        {auth.name}
        <ArrowDropDownIcon color="inherit" />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{'aria-labelledby': 'basic-button'}}
      >
        <MenuItem
          sx={{width: anchorWidth ?? '100%'}}
          onClick={() => {
            setAnchorEl(null);
            setAplusTokenDialogOpen(true);
          }}
        >
          A+ Token
        </MenuItem>
        {auth.role === SystemRole.Admin && (
          <>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setChangePasswordDialogOpen(true);
              }}
            >
              Change password
            </MenuItem>
            <MenuItem onClick={handleResetMfa}>Reset MFA</MenuItem>
          </>
        )}
        <MenuItem onClick={handleLogOut}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default UserButton;
