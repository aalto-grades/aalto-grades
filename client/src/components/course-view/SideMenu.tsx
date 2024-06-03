// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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
  SvgIconTypeMap,
} from '@mui/material';
import {OverridableComponent} from '@mui/types';
import {JSX} from 'react';
import {NavLink, useNavigate, useParams} from 'react-router-dom';

import {CourseRoleType, SystemRole} from '@/common/types';
import {useGetCourse} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {getCourseRole} from '../../utils';

const SideMenuButton = ({
  text,
  to,
  Icon,
  IconOutlined,
  unstable_viewTransition,
}: {
  text: string;
  to: string;
  Icon: OverridableComponent<SvgIconTypeMap> & {muiName: string};
  IconOutlined: OverridableComponent<SvgIconTypeMap> & {
    muiName: string;
  };
  unstable_viewTransition?: boolean;
}): JSX.Element => {
  const navigate = useNavigate();

  return (
    <ListItem disablePadding>
      <NavLink
        to={to}
        style={{
          color: 'inherit',
          width: '100%',
          textDecoration: 'none',
        }}
        unstable_viewTransition={unstable_viewTransition}
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
            // onClick={() => navigate(to)}
          >
            <ListItemIcon>
              {isPending || isTransitioning ? (
                <CircularProgress />
              ) : isActive ? (
                <Icon />
              ) : (
                <IconOutlined />
              )}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        )}
      </NavLink>
    </ListItem>
  );
};

const SideMenu = (): JSX.Element => {
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
          text="Courses List"
          to={'/'}
          Icon={HomeMaxRounded}
          IconOutlined={ArrowBack}
          unstable_viewTransition
        />
        <Divider sx={{my: 2}} />
        <SideMenuButton
          text="Grades"
          to={`/${courseId}/course-results`}
          Icon={FlagCircle}
          IconOutlined={FlagCircleOutlined}
        />
        <SideMenuButton
          text="Grading Models"
          to={`/${courseId}/models`}
          Icon={AccountTree}
          IconOutlined={AccountTreeOutlined}
        />
        <SideMenuButton
          text="Course parts"
          to={`/${courseId}/course-parts`}
          Icon={Widgets}
          IconOutlined={WidgetsOutlined}
        />
        {(auth?.role === SystemRole.Admin ||
          courseRole === CourseRoleType.Teacher) && (
          <>
            <Divider sx={{my: 2}} />
            <SideMenuButton
              text="Edit Course"
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
