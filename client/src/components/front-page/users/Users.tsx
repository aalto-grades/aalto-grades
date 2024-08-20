// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import AddUserDialog from './AddUserDialog';
import UsersTable from './UsersTable';

// Assumes admin validation is already done
const Users = (): JSX.Element => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState<boolean>(false);

  return (
    <>
      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} />
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
          {t('general.users')}
        </Typography>
        <Box sx={{mb: -10 /* Align with tabs */}}>
          <Button
            id="ag-manage-users-btn"
            sx={{mr: 1.5}}
            size="large"
            variant="contained"
            onClick={() => navigate('/manage-students')}
          >
            {t('front-page.manage-users')}
          </Button>
          <Button
            id="ag-new-user-btn"
            size="large"
            variant="contained"
            onClick={() => setAddOpen(true)}
          >
            {t('front-page.add-user')}
          </Button>
        </Box>
      </Box>
      <UsersTable />
    </>
  );
};

export default Users;