// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PersonIcon from '@mui/icons-material/Person';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {Button, Box, Menu, MenuItem} from '@mui/material';
import {JSX, SyntheticEvent, useState} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {UseMutationResult} from '@tanstack/react-query';

import {useLogOut} from '../../hooks/useApi';
import useAuth, {AuthContextType} from '../../hooks/useAuth';
import {State} from '../../types';

export default function UserButton(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {auth, setAuth}: AuthContextType = useAuth();
  const [anchorEl, setAnchorEl]: State<Element | null> =
    useState<Element | null>(null);
  const open: boolean = Boolean(anchorEl);

  const logOut: UseMutationResult = useLogOut({
    onSuccess: () => {
      setAuth(null);
      navigate('/login', {replace: true});
    },
  });

  if (!auth?.name) {
    return <div data-testid="not-logged-in"></div>;
  }

  return (
    <>
      <Button
        color="inherit"
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event: SyntheticEvent): void =>
          setAnchorEl(event.currentTarget)
        }
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
        open={open}
        onClose={(): void => setAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={(): void => logOut.mutate(null)}>Logout</MenuItem>
      </Menu>
    </>
  );
}
