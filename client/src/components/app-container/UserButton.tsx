// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {type JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import OtpAuthDialog from '@/components/shared/auth/OtpAuthDialog';
import TokenDialog from '@/components/shared/auth/TokenDialog';
import {useConfirmMfa, useLogOut, useResetOwnAuth} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {resetToken} from '@/utils';
import ChangePasswordDialog from './ChangePasswordDialog';

const UserButton = (): JSX.Element => {
  const {t} = useTranslation();
  const {auth, setAuth} = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirmMfa = useConfirmMfa();
  const logOut = useLogOut();
  const resetOwnAuth = useResetOwnAuth();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [tokenDialogOpen, setTokenDialogOpen] = useState<boolean>(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState<boolean>(false);
  const [showMfaDialog, setShowMfaDialog] = useState<boolean>(false);
  const [otpAuth, setOtpAuth] = useState<string | null>(null);

  const handleLogOut = async (): Promise<void> => {
    await logOut.mutateAsync();
    resetToken();
    setAuth(null);
    setAnchorEl(null);
    queryClient.clear();
    navigate('/login');
  };

  const handleResetMfa = async (): Promise<void> => {
    setAnchorEl(null);
    const confirmation = await AsyncConfirmationModal({
      title: t('shared.auth.reset-mfa-secret'),
      message: t('shared.auth.reset-mfa-secret-message'),
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

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (auth === null) return <></>;

  return (
    <>
      <TokenDialog
        open={tokenDialogOpen}
        onClose={() => setTokenDialogOpen(false)}
        onSubmit={() => setTokenDialogOpen(false)}
      />
      {auth.role === SystemRole.Admin && (
        <>
          <ChangePasswordDialog
            open={changePasswordDialogOpen}
            onClose={() => setChangePasswordDialogOpen(false)}
          />
          <OtpAuthDialog
            open={showMfaDialog}
            otpAuth={otpAuth}
            cancelText={t('shared.auth.otp-auth.close-without-confirm')}
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
        id="user-button"
        color="inherit"
        aria-controls={menuOpen ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={event => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <Box sx={{mr: {xs: 0, sm: 1}, mt: 1}}>
          <PersonIcon color="inherit" />
        </Box>
        <Box sx={{display: {xs: 'none', sm: 'block'}}}>{auth.name}</Box>
        <ArrowDropDownIcon color="inherit" />
      </Button>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{'aria-labelledby': 'user-button'}}
      >
        <MenuItem
          key="aplus-token"
          onClick={() => {
            setAnchorEl(null);
            setTokenDialogOpen(true);
          }}
        >
          {t('general.a+-api-token')}
        </MenuItem>
        {auth.role === SystemRole.Admin && [
          <MenuItem
            key="change-password"
            onClick={() => {
              setAnchorEl(null);
              setChangePasswordDialogOpen(true);
            }}
          >
            {t('shared.auth.change-password')}
          </MenuItem>,
          <MenuItem key="reset-mfa" onClick={handleResetMfa}>
            {t('shared.auth.reset-mfa')}
          </MenuItem>,
        ]}
        <MenuItem onClick={handleLogOut}>{t('shared.auth.log-out')}</MenuItem>
      </Menu>
    </>
  );
};

export default UserButton;
