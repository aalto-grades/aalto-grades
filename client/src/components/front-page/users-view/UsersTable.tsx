// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {JSX, SyntheticEvent} from 'react';
import {UseQueryResult} from '@tanstack/react-query';

import {HeadCellData} from '../../../types';
import {useDeleteUser, useGetIdpUsers} from '../../../hooks/useApi';
import React from 'react';
import DeleteUserDialog from './DeleteUserDialog';

const headCells: Array<HeadCellData> = [
  {
    id: 'email',
    label: 'Email',
  },
  {
    id: 'del',
    label: '',
  },
];

export default function UsersTable(): JSX.Element {
  const deleteUser = useDeleteUser();
  const users: UseQueryResult<Array<{email: string; id: number}>> =
    useGetIdpUsers();
  const [toBeDeleted, setToBeDeleted] = React.useState<number | null>(null);
  function handleOpen(userId: number) {
    setToBeDeleted(userId);
  }

  function handleClose() {
    setToBeDeleted(null);
  }
  function handleDelete(event: SyntheticEvent, id: number): void {
    event.preventDefault();
    setToBeDeleted(null);
    deleteUser.mutate(id);
  }
  if (users.data?.length === 0 && users.isFetched) {
    return <>No users found</>;
  }
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            {headCells.map((headCell: HeadCellData) => (
              <TableCell key={headCell.id}>
                <Typography sx={{fontWeight: 'bold'}}>
                  {headCell.label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.data &&
            users.data.map((user: {email: string; id: number}) => (
              <TableRow key={user.email} hover={true}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      handleOpen(user.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {toBeDeleted !== null && (
        <DeleteUserDialog
          title="Delete User"
          handleAccept={handleDelete}
          handleClose={handleClose}
          open={toBeDeleted !== null}
          userId={toBeDeleted}
          description="Do you want to delete this user?"
        />
      )}
    </>
  );
}
