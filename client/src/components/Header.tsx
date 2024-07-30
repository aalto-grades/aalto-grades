// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AppBar, Box, Typography, useTheme} from '@mui/material';
import {useState} from 'react';
import {NavLink, useParams} from 'react-router-dom';

import UserButton from './auth/UserButton';
import {useGetCourse} from '../hooks/useApi';

const Header = (): JSX.Element => {
  const theme = useTheme();
  const {courseId} = useParams<{courseId: string}>();
  const course = useGetCourse(courseId ?? '', {enabled: Boolean(courseId)});

  // The logo variants are intended to be used randomly, so why not?
  // https://brand.aalto.fi/visual-identity/about/logo/
  const [logoVariant] = useState(
    ['!', '?', '”'][Math.floor(Math.random() * 3)]
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.vars.palette.primary.light,
          boxShadow: 'none',
          //   color: theme.vars.palette.primary.main,
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
            width: '184px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'primary.main',
          }}
          unstable_viewTransition
        >
          A{logoVariant} Grades
        </Typography>
        {/* <Box
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
              // onClick={() => navigate('/')}
              unstable_viewTransition
            >
              {({isActive, isPending: _, isTransitioning: __}) => {
                if (courseId === undefined) {
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
                      borderRadius: '8px',
                      border: '1px solid black',
                      fontSize: '1rem',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                    }}
                    // onClick={ev => {
                    //   ev.preventDefault();
                    //   document.startViewTransition(() => {
                    //     flushSync(() => {
                    //       navigate('/');
                    //     });
                    //   });
                    // }}
                  >
                    <Icon>
                      <ArrowBack />
                    </Icon>
                    <ListItemText primary="Courses" />
                  </ButtonBase>
                );
              }}
            </NavLink>
          </Box> */}

        {course.data && (
          <>
            <Box
              sx={{
                // backgroundColor: theme.vars.palette.background.paper,
                backgroundColor: theme.vars.palette.background.paper,
                px: 2,
                py: 0,
                mr: 1,
                //   border: '1px solid gray',
                width: 'fit-content',
                borderRadius: '15px',
                // translateY: '-50%',
                height: '40px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                {/* <div
                style={{
                  padding: '0px 5px',
                  border: '1px solid black',
                  borderRadius: '8px',
                  marginRight: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  viewTransitionName: `code-${course.data.id}`,
                  minWidth: 'fit-content',
                  maxWidth: 'fit-content',
                }}
              >
                <Typography align="left">{course.data.courseCode}</Typography>
              </div> */}

                <Typography
                  align="left"
                  variant="body1"
                  sx={{color: 'primary.main'}}
                >
                  <b>{course.data.courseCode}</b>
                </Typography>
              </span>
            </Box>
            <Typography variant="h2" sx={{mr: 1}}>
              {' - '}
            </Typography>
            <Box
              sx={{
                // backgroundColor: theme.vars.palette.background.paper,
                backgroundColor: theme.vars.palette.background.paper,
                px: 2,
                py: 0,
                mr: 1,
                //   border: '1px solid gray',
                width: 'fit-content',
                borderRadius: '15px',
                // translateY: '-50%',
                height: '40px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                {/* <div
                  style={{
                    padding: '0px 5px',
                    border: '1px solid black',
                    borderRadius: '8px',
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    viewTransitionName: `code-${course.data.id}`,
                    minWidth: 'fit-content',
                    maxWidth: 'fit-content',
                  }}
                >
                  <Typography align="left">{course.data.courseCode}</Typography>
                </div> */}

                <Typography
                  variant="h2"
                  align="left"
                  sx={{
                    viewTransitionName: `course-name-${course.data.id}`,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '300px',
                  }}
                >
                  {course.data.name.en}
                </Typography>
                {/* <Typography
                    align="left"
                    type="body2"
                    sx={{color: 'primary.main', mr: 1}}
                  >
                    {course.data.courseCode}
                  </Typography> */}
              </span>
            </Box>
          </>
        )}
        <Box sx={{flexGrow: 1}} />
        <UserButton />
      </AppBar>
    </>
  );
};

export default Header;
