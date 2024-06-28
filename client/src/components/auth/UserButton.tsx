// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {JSX, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import ChangePasswordDialog from './ChangePasswordDialog';
import {useLogOut} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import AplusTokenDialog from '../shared/AplusTokenDialog';

const UserButton = (): JSX.Element => {
  const navigate = useNavigate();
  const {auth, setAuth} = useAuth();
  const queryClient = useQueryClient();
  const logOut = useLogOut();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState<boolean>(false);

  const handleLogOut = async (): Promise<void> => {
    await logOut.mutateAsync(null);
    setAuth(null);
    setAnchorEl(null);
    queryClient.clear();
    navigate('/login', {replace: true});
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
      <ChangePasswordDialog
        onClose={() => setChangePasswordDialogOpen(false)}
        open={changePasswordDialogOpen}
      />

      <Button
        id="basic-button"
        color="inherit"
        aria-controls={menuOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
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
          onClick={() => {
            setAnchorEl(null);
            setAplusTokenDialogOpen(true);
          }}
        >
          A+ Token
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setChangePasswordDialogOpen(true);
          }}
        >
          Change password
        </MenuItem>
        <MenuItem onClick={handleLogOut}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default UserButton;
