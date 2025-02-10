// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown, Check, Language} from '@mui/icons-material';
import {Box, Button, Menu, MenuItem} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

const LanguageSelectButton = (): JSX.Element => {
  const {i18n, t} = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const menuOpen = Boolean(anchorEl);

  const handleClose = (): void => setAnchorEl(null);

  const setLanguage = (language: string): void => {
    i18n.changeLanguage(language);
    handleClose();
  };

  return (
    <>
      <Button
        id="language-button"
        color="inherit"
        aria-controls={menuOpen ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <Box sx={{marginRight: 1, marginTop: 1}}>
          <Language color="inherit" />
        </Box>
        {t('language')}
        <ArrowDropDown color="inherit" />
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        MenuListProps={{'aria-labelledby': 'language-button'}}
      >
        <MenuItem onClick={() => setLanguage('en')}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{width: 24, display: 'flex', justifyContent: 'center'}}>
              {i18n.language === 'en' && (
                <Check color="inherit" fontSize="small" />
              )}
            </Box>
            <Box>English (en)</Box>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => setLanguage('fi')}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{width: 24, display: 'flex', justifyContent: 'center'}}>
              {i18n.language === 'fi' && (
                <Check color="inherit" fontSize="small" />
              )}
            </Box>
            <Box>Suomi (fi)</Box>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => setLanguage('sv')}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{width: 24, display: 'flex', justifyContent: 'center'}}>
              {i18n.language === 'sv' && (
                <Check color="inherit" fontSize="small" />
              )}
            </Box>
            <Box>Svenska (sv)</Box>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelectButton;
