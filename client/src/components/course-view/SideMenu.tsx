// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, SystemRole} from '@common/types';
import {
  AccountTree,
  AccountTreeOutlined,
  Edit,
  FlagCircle,
  FlagCircleOutlined,
  Widgets,
  WidgetsOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {NavLink, useNavigate, useParams} from 'react-router-dom';
import {AuthContextType} from '../../context/AuthProvider';
import {useGetCourse} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';

const SideMenu = ({onUpload}: {onUpload: () => void}) => {
  const {courseId} = useParams();
  const navigate = useNavigate();

  const course: UseQueryResult<CourseData> = useGetCourse(courseId!, {
    enabled: !!courseId,
  });

  const {
    auth,
    isTeacherInCharge: _,
    setIsTeacherInCharge,
  }: AuthContextType = useAuth();

  return (
    <>
      <Box
        style={{
          width: courseId ? '204px' : '0px',
          minWidth: courseId ? '204px' : '0px',
          transition: 'all 0.3s',
          overflow: 'clip',
        }}
      >
        <Box
          style={{
            width: '204px',
            minWidth: '204px',
          }}
        >
          <ListItem disablePadding>
            <NavLink
              to={'/'}
              style={{
                color: 'inherit',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              {({isActive, isPending: _, isTransitioning: __}) => {
                return (
                  <ListItemButton
                    sx={{
                      color: 'inherit',
                      width: '100%',
                      // padding: 1,
                      borderRadius: 100,
                      fontSize: '1rem',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                    }}
                    onClick={(): void => {
                      navigate('/');
                    }}
                  >
                    <ListItemIcon>
                      {isActive ? <FlagCircle /> : <FlagCircleOutlined />}
                    </ListItemIcon>
                    <ListItemText primary="Courses List" />
                  </ListItemButton>
                );
              }}
            </NavLink>
          </ListItem>

          <Divider sx={{mb: 2, mt: 1}} />
          <Button variant="outlined" onClick={onUpload}>
            Upload Grades
          </Button>
          <Divider sx={{my: 2}} />
          <List>
            <ListItem disablePadding>
              <NavLink
                to={`/${courseId}/course-results`}
                style={{
                  color: 'inherit',
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                {({isActive, isPending: _, isTransitioning: __}) => {
                  return (
                    <ListItemButton
                      sx={{
                        color: 'inherit',
                        width: '100%',
                        // padding: 1,
                        borderRadius: 100,
                        fontSize: '1rem',
                        textAlign: 'left',
                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                      }}
                      onClick={(): void => {
                        navigate(`/${courseId}/course-results`);
                      }}
                    >
                      <ListItemIcon>
                        {isActive ? <FlagCircle /> : <FlagCircleOutlined />}
                      </ListItemIcon>
                      <ListItemText primary="Grades" />
                    </ListItemButton>
                  );
                }}
              </NavLink>
            </ListItem>

            <ListItem disablePadding>
              <NavLink
                to={`/${courseId}/models`}
                style={{
                  color: 'inherit',
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                {({isActive, isPending: _, isTransitioning: __}) => {
                  return (
                    <ListItemButton
                      sx={{
                        color: 'inherit',
                        width: '100%',
                        // padding: 1,
                        borderRadius: 100,
                        fontSize: '1rem',
                        textAlign: 'left',
                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                      }}
                      onClick={(): void => {
                        navigate(`/${courseId}/models`);
                      }}
                    >
                      <ListItemIcon>
                        {isActive ? <AccountTree /> : <AccountTreeOutlined />}
                      </ListItemIcon>
                      <ListItemText primary="Grading Models" />
                    </ListItemButton>
                  );
                }}
              </NavLink>
            </ListItem>
            <ListItem disablePadding>
              <NavLink
                to={`/${courseId}/attainments`}
                style={{
                  color: 'inherit',
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                {({isActive, isPending: _, isTransitioning: __}) => {
                  return (
                    <ListItemButton
                      sx={{
                        color: 'inherit',
                        width: '100%',
                        // padding: 1,
                        borderRadius: 100,
                        fontSize: '1rem',
                        textAlign: 'left',
                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                      }}
                      onClick={(): void => {
                        navigate(`/${courseId}/attainments`);
                      }}
                    >
                      <ListItemIcon>
                        {isActive ? <Widgets /> : <WidgetsOutlined />}
                      </ListItemIcon>
                      <ListItemText primary="Attainments" />
                    </ListItemButton>
                  );
                }}
              </NavLink>
            </ListItem>
            {auth?.role === SystemRole.Admin && (
              <>
                <Divider sx={{my: 2}} />
                <ListItem disablePadding>
                  <NavLink
                    to={`/${courseId}/edit`}
                    style={{
                      color: 'inherit',
                      width: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    {({isActive, isPending: _, isTransitioning: __}) => {
                      return (
                        <ListItemButton
                          sx={{
                            color: 'inherit',
                            width: '100%',
                            // padding: 1,
                            borderRadius: 100,
                            fontSize: '1rem',
                            textAlign: 'left',
                            backgroundColor: isActive
                              ? 'rgba(0, 0, 0, 0.1)'
                              : '',
                          }}
                          onClick={(): void => {
                            navigate(`/${courseId}/post/edit`);
                          }}
                        >
                          <ListItemIcon>
                            <Edit />
                          </ListItemIcon>
                          <ListItemText primary="Edit Course" />
                        </ListItemButton>
                      );
                    }}
                  </NavLink>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Box>
    </>
  );
};

export default SideMenu;
