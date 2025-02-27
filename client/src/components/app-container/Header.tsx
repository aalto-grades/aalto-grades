// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AppBar, Box, Typography, useTheme} from '@mui/material';
import {useMemo} from 'react';
import {NavLink, useParams} from 'react-router-dom';

import {useGetCourse} from '@/hooks/useApi';
import {useLocalize} from '@/hooks/useLocalize';
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
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.vars.palette.primary.light,
        boxShadow: 'none',
        color: 'black',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        px: 3,
      }}
    >
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
          color: 'primary.main',
        }}
        data-testid="a-grades-header-link" // For e2e tests
        viewTransition
      >
        A{logoVariant} Grades
      </Typography>
      {course.data !== undefined && (
        <>
          <Box
            sx={{
              backgroundColor: theme.vars.palette.background.paper,
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
              variant="body1"
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
          <Box
            sx={{
              backgroundColor: theme.vars.palette.background.paper,
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
        </>
      )}
      <Box sx={{flexGrow: 1}} />
      <LanguageSelectButton />
      <UserButton />
    </AppBar>
  );
};

export default Header;
