// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import DeleteIcon from '@mui/icons-material/Delete';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {JSX, useState} from 'react';

import {useDeleteUser, useGetIdpUsers} from '../../../hooks/useApi';
import {HeadCellData} from '../../../types';
import DeleteUserDialog from './DeleteUserDialog';

const headCells: HeadCellData[] = [
  {id: 'email', label: 'Email'},
  {id: 'del', label: ''},
];

export default function UsersTable(): JSX.Element {
  const deleteUser = useDeleteUser();
  const users = useGetIdpUsers();
  const [toBeDeleted, setToBeDeleted] = useState<number | null>(null);

  const handleDelete = (id: number): void => {
    setToBeDeleted(null);
    deleteUser.mutate(id);
  };

  if (users.data?.length === 0 && users.isFetched) return <>No users found</>;

  return (
    <>
      {toBeDeleted !== null && (
        <DeleteUserDialog
          title="Delete User"
          handleAccept={handleDelete}
          handleClose={() => setToBeDeleted(null)}
          open={toBeDeleted !== null}
          userId={toBeDeleted}
          description="Do you want to delete this user?"
        />
      )}

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
          {users.data &&
            users.data.map(user => (
              <TableRow key={user.email ?? `user-${user.id}`} hover={true}>
                <TableCell>{user.email ?? 'No email'}</TableCell>
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
    </>
  );
}
