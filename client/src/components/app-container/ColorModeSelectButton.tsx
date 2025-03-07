// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import {Button} from '@mui/material';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useColorScheme} from '@mui/material/styles';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

const ColorModeSelectButton = (): JSX.Element => {
  const {t} = useTranslation();
  const {mode, systemMode, setMode} = useColorScheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleMode = (targetMode: 'system' | 'light' | 'dark') => () => {
    setMode(targetMode);
    handleClose();
  };

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={theme => ({
          verticalAlign: 'bottom',
          display: 'inline-flex',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: theme.shape.borderRadius,
          border: '1px solid',
          borderColor: theme.palette.divider,
        })}
      />
    );
  }

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const icon = {
    light: <LightModeIcon color="inherit" />,
    dark: <DarkModeIcon color="inherit" />,
  }[resolvedMode];

  return (
    <>
      <Button
        id="color-mode-button"
        color="inherit"
        aria-controls={menuOpen ? 'color-mode-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={handleClick}
      >
        <Box sx={{marginTop: 1}}>{icon}</Box>
        <ArrowDropDown color="inherit" />
      </Button>
      <Menu
        id="color-mode-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        MenuListProps={{'aria-labelledby': 'color-mode-button'}}
      >
        <MenuItem selected={mode === 'system'} onClick={handleMode('system')}>
          {t('color-mode.system')}
        </MenuItem>
        <MenuItem selected={mode === 'light'} onClick={handleMode('light')}>
          {t('color-mode.light')}
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={handleMode('dark')}>
          {t('color-mode.dark')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ColorModeSelectButton;
