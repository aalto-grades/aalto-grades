// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  AccountTree,
  AccountTreeOutlined,
  ArrowBack,
  Edit,
  EditOutlined,
  FlagCircle,
  FlagCircleOutlined,
  HomeMaxRounded,
  Widgets,
  WidgetsOutlined,
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  type SvgIconTypeMap,
} from '@mui/material';
import type {OverridableComponent} from '@mui/types';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink, useParams} from 'react-router-dom';

import {CourseRoleType, SystemRole} from '@/common/types';
import {useGetCourse} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {getCourseRole} from '@/utils';

const SideMenuButton = ({
  text,
  to,
  Icon,
  IconOutlined,
  viewTransition,
}: {
  text: string;
  to: string;
  Icon: OverridableComponent<SvgIconTypeMap> & {muiName: string};
  IconOutlined: OverridableComponent<SvgIconTypeMap> & {
    muiName: string;
  };
  viewTransition?: boolean;
}): JSX.Element => (
  <ListItem disablePadding>
    <NavLink
      to={to}
      style={{
        color: 'inherit',
        width: '100%',
        textDecoration: 'none',
      }}
      viewTransition={viewTransition}
    >
      {({isActive, isPending, isTransitioning}) => (
        <ListItemButton
          sx={{
            color: 'inherit',
            width: '100%',
            borderRadius: 3,
            fontSize: '1rem',
            textAlign: 'left',
            backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
            transition: 'border-radius 1s',
          }}
        >
          <ListItemIcon>
            {(isPending || isTransitioning)
              ? <CircularProgress />
              : (isActive
                  ? <Icon />
                  : <IconOutlined />)}
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItemButton>
      )}
    </NavLink>
  </ListItem>
);

const SideMenu = (): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams();
  const {auth} = useAuth();

  const course = useGetCourse(courseId as string, {
    enabled: courseId !== undefined,
  });

  const courseRole =
    course.data !== undefined && auth !== null
      ? getCourseRole(course.data, auth)
      : CourseRoleType.Student;

  return (
    <Box
      style={{
        width: 'var(--side-menu-width)',
        minWidth: 'var(--side-menu-width)',
      }}
    >
      <List>
        <SideMenuButton
          text={t('course.list')}
          to="/"
          Icon={HomeMaxRounded}
          IconOutlined={ArrowBack}
          viewTransition
        />
        <Divider sx={{my: 2}} />
        <SideMenuButton
          text={t('general.grades')}
          to={`/${courseId}/course-results`}
          Icon={FlagCircle}
          IconOutlined={FlagCircleOutlined}
        />
        <SideMenuButton
          text={t('general.grading-models')}
          to={`/${courseId}/models`}
          Icon={AccountTree}
          IconOutlined={AccountTreeOutlined}
        />
        <SideMenuButton
          text={t('general.course-parts')}
          to={`/${courseId}/course-parts`}
          Icon={Widgets}
          IconOutlined={WidgetsOutlined}
        />
        {(auth?.role === SystemRole.Admin
          || courseRole === CourseRoleType.Teacher) && (
          <>
            <Divider sx={{my: 2}} />
            <SideMenuButton
              text={t('course.edit.title')}
              to={`/${courseId}/edit`}
              Icon={Edit}
              IconOutlined={EditOutlined}
            />
          </>
        )}
      </List>
    </Box>
  );
};

export default SideMenu;
