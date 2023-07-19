// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Menu, MenuItem } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, SyntheticEvent } from 'react';

import { State } from '../../types';

// A styled menu button. When clicked, a dropdown menu appears

const StyledMenu = styled((props: any): JSX.Element => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }: { theme: Theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px,'
      + ' rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: theme.palette.primary.main
      },
    },
  },
}));

export interface MenuButtonOption {
  description: string,
  handleClick: () => void
}

export default function MenuButton(props: {
  label: string,
  options: Array<MenuButtonOption>
}): JSX.Element {
  const [anchorEl, setAnchorEl]: State<Element | null> = useState<Element | null>(null);
  const open: boolean = Boolean(anchorEl);

  function handleClick(event: SyntheticEvent): void {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(): void {
    setAnchorEl(null);
  }

  function renderOptions(options: Array<MenuButtonOption>): Array<JSX.Element> {
    return (
      options.map((option: MenuButtonOption) => (
        <MenuItem
          className='ag_menu_btn_option'
          key={option.description}
          disableRipple
          onClick={(): void => {
            option.handleClick();
            handleClose();
          }}>
          {option.description}
        </MenuItem>
      ))
    );
  }

  return (
    <div>
      <Button
        id="menu-button"
        aria-controls={open ? 'menu-button' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {props.label}
      </Button>
      <StyledMenu
        id="menu-button"
        MenuListProps={{
          'aria-labelledby': 'menu-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        { renderOptions(props.options) }
      </StyledMenu>
    </div>
  );
}

MenuButton.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array,
};
