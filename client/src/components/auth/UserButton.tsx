// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import ChangePasswordDialog from './ChangePasswordDialog';
import OtpAuthDialog from './OtpAuthDialog';
import {useLogOut, useResetOwnAuth} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import AplusTokenDialog from '../shared/AplusTokenDialog';

const UserButton = (): JSX.Element => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {auth, setAuth} = useAuth();
  const queryClient = useQueryClient();
  const logOut = useLogOut();
  const resetOwnAuth = useResetOwnAuth();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState<boolean>(false);
  const [otpAuth, setOtpAuth] = useState<string | null>(null);

  const handleLogOut = async (): Promise<void> => {
    await logOut.mutateAsync();
    setAuth(null);
    setAnchorEl(null);
    queryClient.clear();
    navigate('/login', {replace: true});
  };

  const handleResetMfa = async (): Promise<void> => {
    setAnchorEl(null);
    const confirmation = await AsyncConfirmationModal({
      title: t('auth.reset-mfa-secret'),
      message: t('auth.reset-mfa-secret-message'),
    });
    if (!confirmation) return;

    const otpAuthRes = await resetOwnAuth.mutateAsync({
      resetPassword: false,
      resetMfa: true,
    });
    setOtpAuth(otpAuthRes.otpAuth as string);
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
            otpAuth={otpAuth}
            onClose={() => setOtpAuth(null)}
            closeText={'Close'}
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
          {t('general.a+-token')}
        </MenuItem>
        {auth.role === SystemRole.Admin && (
          <>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setChangePasswordDialogOpen(true);
              }}
            >
              {t('auth.change-password')}
            </MenuItem>
            <MenuItem onClick={handleResetMfa}>{t('auth.reset-mfa')}</MenuItem>
          </>
        )}
        <MenuItem onClick={handleLogOut}>{t('auth.log-out')}</MenuItem>
      </Menu>
    </>
  );
};

export default UserButton;
