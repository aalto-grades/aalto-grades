// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {SystemRole} from '@/common/types';
import {useGetAllCourses, useGetOwnCourses} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import CourseTable from './front-page/CourseTable';
import CreateCourseDialog from './front-page/CreateCourseDialog';
import Users from './front-page/users/Users';

const FrontPageView = (): JSX.Element => {
  const {t} = useTranslation();
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
            <Box sx={{p: 1, mt: 1}}>
              <Typography>{t('front-page.no-courses')}</Typography>
            </Box>
          )}
        </>
      )}

      {auth?.role === SystemRole.User && (
        <>
          <CreateCourseDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            forceEmail={auth.email}
          />
          <Button
            size="large"
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            sx={{mb: -11.25}} // Align with search
          >
            {t('front-page.create-new-course')}
          </Button>
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
              {t('general.courses')}
            </Typography>
            <Button
              size="large"
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
              sx={{mb: -11.25}} // Align with search
            >
              {t('front-page.create-new-course')}
            </Button>
          </Box>
          {courses.data !== undefined && <CourseTable courses={courses.data} />}
          <Users />
        </>
      )}
    </>
  );
};

export default FrontPageView;
