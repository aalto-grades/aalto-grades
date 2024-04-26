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

import {SystemRole} from '@common/types';
import useAuth from '../../hooks/useAuth';

const SideMenuButton = ({
  text,
  to,
  Icon,
  IconOutlined,
}: {
  text: string;
  to: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {muiName: string};
  IconOutlined: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
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
        {auth?.role === SystemRole.Admin && (
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
