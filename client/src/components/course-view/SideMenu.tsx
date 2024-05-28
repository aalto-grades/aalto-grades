// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AccountTree,
  AccountTreeOutlined,
  Edit,
  EditOutlined,
  FlagCircle,
  FlagCircleOutlined,
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
}: {
  text: string;
  to: string;
  Icon: OverridableComponent<SvgIconTypeMap> & {muiName: string};
  IconOutlined: OverridableComponent<SvgIconTypeMap> & {
    muiName: string;
  };
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
      >
        {({isActive, isPending, isTransitioning}) => (
          <ListItemButton
            sx={{
              color: 'inherit',
              width: '100%',
              borderRadius: 100,
              fontSize: '1rem',
              textAlign: 'left',
              backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
            }}
            onClick={() => navigate(to)}
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
        width: '204px',
        minWidth: '204px',
      }}
    >
      {/* <SideMenuButton
        text="Courses List"
        to="/"
        Icon={FlagCircle}
        IconOutlined={FlagCircleOutlined}
      />

      <Divider sx={{mb: 2, mt: 1}} />
      <Button variant="outlined" onClick={onUpload}>
        Upload Grades
      </Button>
      <Divider sx={{my: 2}} /> */}
      <List>
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
          text="Attainments"
          to={`/${courseId}/attainments`}
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
