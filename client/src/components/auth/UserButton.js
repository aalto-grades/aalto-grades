// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { PropTypes } from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PersonIcon from '@mui/icons-material/Person';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import useAuth from '../../hooks/useAuth';

function UserButton({ signOut }) {
  const { auth } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!auth?.name) {
    return (<></>);
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

UserButton.propTypes = {
  signOut: PropTypes.func,
  name: PropTypes.string
};

export default UserButton;