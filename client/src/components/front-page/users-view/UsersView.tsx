// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {JSX, useState} from 'react';

import AddUserDialog from './AddUserDialog';
import UsersTable from './UsersTable';

// Assumes admin validation is already done TODO: maybe change in the future
const UsersView = (): JSX.Element => {
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
          Users
        </Typography>
        <Button
          id="ag_new_course_btn"
          size="large"
          variant="contained"
          onClick={() => setAddOpen(true)}
        >
          Add user
        </Button>
      </Box>
      <UsersTable />
    </>
  );
};

export default UsersView;
