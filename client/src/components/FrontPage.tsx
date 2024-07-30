// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography, useTheme} from '@mui/material';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {SystemRole} from '@/common/types';
import CourseTable from './front-page/CourseTable';
import CreateCourseDialog from './front-page/CreateCourseDialog';
import UsersView from './front-page/users-view/UsersView';
import {useGetAllCourses, useGetOwnCourses} from '../hooks/useApi';
import useAuth from '../hooks/useAuth';

const FrontPage = (): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {auth} = useAuth();
  const courses = useGetAllCourses({
    enabled: auth !== null && auth.role === SystemRole.Admin,
  });
  const coursesOfUser = useGetOwnCourses();
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  return (
    <>
      {auth?.role !== SystemRole.Admin && (
        <>
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Typography variant="h2" align="left" sx={{flexGrow: 1}}>
              {t('front-page.your-courses')}
            </Typography>
          </Box>
          {coursesOfUser.data && coursesOfUser.data.length > 0 ? (
            <CourseTable courses={coursesOfUser.data} />
          ) : (
            <Box
              sx={{
                backgroundColor: theme.vars.palette.hoverGrey2,
                p: 1,
                mt: 1,
              }}
            >
              <Typography>{t('front-page.no-courses')}</Typography>
            </Box>
          )}
        </>
      )}
      {auth?.role === SystemRole.Admin && (
        <>
          <CreateCourseDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
          />
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Typography variant="h2" align="left" sx={{flexGrow: 1}}>
              {t('front-page.courses')}
            </Typography>
            <Button
              id="ag-new-course-btn"
              size="large"
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
              sx={{mb: -11.25}} // Align with search
            >
              {t('front-page.create-course')}
            </Button>
          </Box>
          {courses.data && <CourseTable courses={courses.data} />}
          <UsersView />
        </>
      )}
    </>
  );
};

export default FrontPage;
