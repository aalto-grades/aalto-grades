// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PersonIcon from '@mui/icons-material/Person';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, Box, Menu, MenuItem } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import useAuth, { AuthContextType } from '../../hooks/useAuth';
//import useLogout from '../../hooks/useLogout';
import { State } from '../../types';

export default function UserButton(): JSX.Element {
  //const logout: () => Promise<void> = useLogout();
  const navigate: NavigateFunction = useNavigate();
  const { auth }: AuthContextType = useAuth();
  const [anchorEl, setAnchorEl]: State<Element | null> = useState<Element | null>(null);
  const open: boolean = Boolean(anchorEl);

  // temporary function for logging out, will be moved to a seperate file once toolbar is refined
  async function signOut(): Promise<void> {
    //await logout();
    navigate('/login', { replace: true });
  }

  function handleClick(event: SyntheticEvent): void {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(): void {
    setAnchorEl(null);
  }

  if (!auth?.name) {
    return (<div data-testid="not-logged-in"></div>);
  }

  return (
    <>
      <Button
        color="inherit"
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Box sx={{ marginRight: 1, marginTop: 1 }}>
          <PersonIcon color="inherit" />
        </Box>
        {auth.name}
        <ArrowDropDownIcon color="inherit" />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={signOut}>Logout</MenuItem>
      </Menu>
    </>
  );
}
