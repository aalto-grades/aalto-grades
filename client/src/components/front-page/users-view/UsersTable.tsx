// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import DeleteIcon from '@mui/icons-material/Delete';
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
  Typography,
} from '@mui/material';
import {JSX, useMemo, useState} from 'react';

import {SystemRole} from '@/common/types';
import DeleteUserDialog from './DeleteUserDialog';
import {useDeleteUser, useGetUsers} from '../../../hooks/useApi';
import {HeadCellData} from '../../../types';

const headCells: HeadCellData[] = [
  {id: 'email', label: 'Email'},
  {id: 'del', label: ''},
];

const UsersTable = (): JSX.Element => {
  const deleteUser = useDeleteUser();
  const users = useGetUsers();
  const [tab, setTab] = useState<number>(0);
  const [toBeDeleted, setToBeDeleted] = useState<number | null>(null);

  const shownUsers = useMemo(() => {
    if (users.data === undefined) return [];
    if (tab === 0)
      return users.data.filter(user => user.idpUser && user.email !== null);
    return users.data.filter(user => user.role === SystemRole.Admin);
  }, [tab, users.data]);

  const handleDelete = (id: number): void => {
    setToBeDeleted(null);
    deleteUser.mutate(id);
  };

  if (users.data?.length === 0 && users.isFetched) return <>No users found</>;

  return (
    <>
      <DeleteUserDialog
        title="Delete user"
        handleAccept={handleDelete}
        handleClose={() => setToBeDeleted(null)}
        open={toBeDeleted !== null}
        userId={toBeDeleted}
        description="Do you want to delete this user?"
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
                  <IconButton
                    aria-label="delete"
                    onClick={() => setToBeDeleted(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
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
