// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {JSX, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {useLogOut} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import AplusTokenDialog from '../shared/AplusTokenDialog';

const UserButton = (): JSX.Element => {
  const navigate = useNavigate();
  const {auth, setAuth} = useAuth();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);

  const queryClient = useQueryClient();
  const logOut = useLogOut({
    onSuccess: () => {
      setAuth(null);
      setAnchorEl(null);
      queryClient.clear();
      navigate('/login', {replace: true});
    },
  });

  if (auth?.name === undefined) {
    return <div data-testid="not-logged-in"></div>;
  }

  return (
    <>
      <Button
        id="basic-button"
        color="inherit"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
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
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{'aria-labelledby': 'basic-button'}}
      >
        <MenuItem onClick={() => setAplusTokenDialogOpen(true)}>
          A+ Token
        </MenuItem>
        <MenuItem onClick={() => logOut.mutate(null)}>Logout</MenuItem>
      </Menu>
      <AplusTokenDialog
        handleClose={() => setAplusTokenDialogOpen(false)}
        handleSubmit={() => setAplusTokenDialogOpen(false)}
        open={aplusTokenDialogOpen}
      />
    </>
  );
};

export default UserButton;
