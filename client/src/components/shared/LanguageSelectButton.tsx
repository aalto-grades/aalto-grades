// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown, Language} from '@mui/icons-material';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

const LanguageSelectButton = (): JSX.Element => {
  const {i18n} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const menuOpen = Boolean(anchorEl);

  const setLanguage = (language: string): void => {
    i18n.changeLanguage(language);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="basic-button"
        color="inherit"
        aria-controls={menuOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={event => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <Box sx={{marginRight: 1, marginTop: 1}}>
          <Language color="inherit" />
        </Box>
        {i18n.language === 'fi'
          ? 'Finnish'
          : i18n.language === 'sv'
            ? 'Swedish'
            : 'English'}
        <ArrowDropDown color="inherit" />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{'aria-labelledby': 'basic-button'}}
      >
        <MenuItem onClick={() => setLanguage('en')}>English</MenuItem>
        <MenuItem onClick={() => setLanguage('fi')}>Finnish</MenuItem>
        <MenuItem onClick={() => setLanguage('sv')}>Swedish</MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelectButton;
