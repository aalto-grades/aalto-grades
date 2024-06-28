// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Delete, LockReset} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import {JSX, useMemo, useState} from 'react';

import {SystemRole, UserData} from '@/common/types';
import DeleteUserDialog from './DeleteUserDialog';
import ResetPasswordDialog from './resetPasswordDialog';
import {useGetUsers} from '../../../hooks/useApi';
import {HeadCellData} from '../../../types';

const headCells: HeadCellData[] = [
  {id: 'email', label: 'Email'},
  {id: 'actions', label: ''},
];

const UsersTable = (): JSX.Element => {
  const users = useGetUsers();
  const [tab, setTab] = useState<number>(0);
  const [toBeDeleted, setToBeDeleted] = useState<UserData | null>(null);
  const [toBeReset, setToBeReset] = useState<UserData | null>(null);

  const shownUsers = useMemo(() => {
    if (users.data === undefined) return [];
    if (tab === 0)
      return users.data.filter(user => user.idpUser && user.email !== null);
    return users.data.filter(user => user.role === SystemRole.Admin);
  }, [tab, users.data]);

  if (users.data?.length === 0 && users.isFetched) return <>No users found</>;

  return (
    <>
      <DeleteUserDialog
        open={toBeDeleted !== null}
        onClose={() => setToBeDeleted(null)}
        user={toBeDeleted}
      />
      <ResetPasswordDialog
        open={toBeReset !== null}
        onClose={() => setToBeReset(null)}
        user={toBeReset}
      />

      <Tabs value={tab} onChange={(_, newTab: number) => setTab(newTab)}>
        <Tab label="IDP-Users" sx={{textTransform: 'none'}} />
        <Tab label="Admins" sx={{textTransform: 'none'}} />
      </Tabs>
      <Box sx={{px: 1}}>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map(headCell => (
                <TableCell key={headCell.id}>
                  <Typography sx={{fontWeight: 'bold'}}>
                    {headCell.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shownUsers.map(user => (
              <TableRow key={user.email} hover={true}>
                <TableCell sx={{width: '75%'}}>{user.email}</TableCell>
                <TableCell>
                  <Tooltip title="Reset password" placement="top">
                    <span>
                      <IconButton
                        disabled={tab === 0}
                        aria-label="reset password"
                        onClick={() => setToBeReset(user)}
                      >
                        <LockReset />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete user" placement="top">
                    <span>
                      <IconButton
                        aria-label="delete"
                        onClick={() => setToBeDeleted(user)}
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};

export default UsersTable;
