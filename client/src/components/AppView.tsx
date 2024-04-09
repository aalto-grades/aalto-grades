// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowBack} from '@mui/icons-material';
import {
  AppBar,
  Box,
  ButtonBase,
  Container,
  Icon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import {JSX} from 'react';
import {Link, NavLink, Outlet, useNavigate, useParams} from 'react-router-dom';
import {useGetCourse} from '../hooks/useApi';
import Footer from './Footer';
import UserButton from './auth/UserButton';

export default function SectionTitle(): JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const {courseId} = useParams<{courseId: string}>();
  const course = useGetCourse(courseId ?? '', {enabled: !!courseId});

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.vars.palette.primary.light,
          boxShadow: 'none',
          //   color: theme.vars.palette.primary.main,
          color: 'black',
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              mr: 2,
              width: '184px',
              cursor: 'pointer',
            }}
          >
            A! Grades
          </Typography>
          <Box
            sx={{
              //   //   backgroundColor: theme.vars.palette.background.paper,
              //   //   backgroundColor: theme.vars.palette.background.paper,
              //   px: 1.2,
              // py: 0.2,
              //   //   border: '1px solid gray',
              //   width: 'fit-content',
              //   borderRadius: '15px',
              //   translateY: '-50%',
              mr: 1,
            }}
          >
            <NavLink
              to={'/'}
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {({isActive, isPending: _, isTransitioning: __}) => {
                if (isActive) {
                  return null;
                }
                return (
                  <ButtonBase
                    sx={{
                      display: 'flex',
                      color: 'inherit',
                      alignItems: 'center',
                      // width: '100%',
                      py: '0px',
                      px: 1,
                      borderRadius: 3,
                      border: '1px solid black',
                      fontSize: '1rem',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                    }}
                    onClick={(): void => {
                      navigate('/');
                    }}
                  >
                    <Icon>
                      <ArrowBack />
                    </Icon>
                    <ListItemText primary="Courses" />
                  </ButtonBase>
                );
              }}
            </NavLink>
          </Box>

          {course.data && (
            <Box
              sx={{
                //   backgroundColor: theme.vars.palette.background.paper,
                backgroundColor: theme.vars.palette.background.paper,
                px: 1.2,
                py: 0.2,
                //   border: '1px solid gray',
                width: 'fit-content',
                borderRadius: '15px',
                translateY: '-50%',
              }}
            >
              <span style={{display: 'flex', alignItems: 'center'}}>
                <div
                  style={{
                    padding: '0px 5px',
                    border: '1px solid black',
                    borderRadius: '5px',
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    height: 'fit-content',
                  }}
                >
                  <Typography align="left">
                    {course?.data?.courseCode}
                  </Typography>
                </div>

                <Typography variant="h2" align="left">
                  {course?.data?.name.en}
                </Typography>
              </span>
            </Box>
          )}
          <Box sx={{flexGrow: 1}} />
          <UserButton />
        </Toolbar>
      </AppBar>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.vars.palette.primary.light,
        }}
      >
        <Container
          sx={{textAlign: 'center', m: 0, px: 1}}
          maxWidth={false}
          disableGutters
        >
          <Box>
            <Outlet />
          </Box>
        </Container>
        <Footer />
      </div>
    </>
  );
}
