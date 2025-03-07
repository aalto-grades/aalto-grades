// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {AppBar, Box, Tooltip, Typography, useTheme} from '@mui/material';
import {useMemo} from 'react';
import {NavLink, useParams} from 'react-router-dom';

import {useGetCourse} from '@/hooks/useApi';
import {useLocalize} from '@/hooks/useLocalize';
import ColorModeSelectButton from './ColorModeSelectButton';
import LanguageSelectButton from './LanguageSelectButton';
import UserButton from './UserButton';

const Header = (): JSX.Element => {
  const {courseId} = useParams<{courseId: string}>();
  const localize = useLocalize();
  const theme = useTheme();
  const course = useGetCourse(courseId ?? '', {enabled: Boolean(courseId)});

  // The logo variants are intended to be used randomly, so why not?
  // https://brand.aalto.fi/visual-identity/about/logo/
  const logoVariant = useMemo(
    () => ['!', '?', '”'][Math.floor(Math.random() * 3)],
    []
  );

  return (
    <AppBar position="static" sx={{px: 3}}>
      <Typography
        variant="h2"
        component={NavLink}
        to="/"
        sx={{
          textDecoration: 'none',
          mr: 2,
          minWidth: '184px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color:
            theme.palette.mode === 'light'
              ? 'primary.dark'
              : 'primary.contrastText',
        }}
        data-testid="a-grades-header-link"
        viewTransition
      >
        Ossi{logoVariant}
      </Typography>
      {course.data !== undefined && (
        <>
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              px: 2,
              py: 0,
              mr: 1,
              minWidth: 'fit-content',
              borderRadius: '15px',
              height: '40px',
              alignItems: 'center',
            }}
          >
            <Typography
              align="left"
              variant="h6"
              fontWeight="bold"
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {course.data.courseCode}
            </Typography>
          </Box>
          <Typography variant="h2" sx={{mr: 1}}>
            {' - '}
          </Typography>
          <Tooltip title={localize(course.data.name)}>
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                px: 2,
                py: 0,
                mr: 1,
                minWidth: '10px',
                maxWidth: 'fit-content',
                borderRadius: '15px',
                height: '40px',
                alignItems: 'center',
                flex: '1 1 fit-content',
              }}
            >
              <Typography
                variant="h6"
                align="left"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  lineHeight: '40px',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                {localize(course.data.name)}
              </Typography>
            </Box>
          </Tooltip>
        </>
      )}
      <Box sx={{flexGrow: 1}} />
      <ColorModeSelectButton />
      <LanguageSelectButton />
      <UserButton />
    </AppBar>
  );
};

export default Header;
