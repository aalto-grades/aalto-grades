// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {SystemRole} from '@common/types';
import {JSX} from 'react';
import {Box, Button, Typography} from '@mui/material';
import {NavigateFunction, useNavigate} from 'react-router-dom';

import useAuth, {AuthContextType} from '../../../hooks/useAuth';
import UsersTable from './UsersTable';

export default function UsersView(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const {auth}: AuthContextType = useAuth();
  return (
    <>
      <Box
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          mt: 5,
        }}
      >
        <Typography variant="h2" align="left" sx={{flexGrow: 1}}>
          Users
        </Typography>
        {
          /* Admins are shown the button for  a user */
          auth?.role === SystemRole.Admin && (
            <Button
              id="ag_new_course_btn"
              size="large"
              variant="contained"
              onClick={(): void => {
                navigate('/user/add');
              }}
            >
              Add user
            </Button>
          )
        }
      </Box>
      <UsersTable />
    </>
  );
}
