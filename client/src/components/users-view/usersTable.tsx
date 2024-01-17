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
} from '@mui/material';
import {JSX} from 'react';
import {UseQueryResult} from '@tanstack/react-query';

import {HeadCellData} from '../../types';
import {useGetIdpUsers} from '../../hooks/useApi';

const headCells: Array<HeadCellData> = [
  {
    id: 'email',
    label: 'Email',
  },
];

export default function UsersTable(): JSX.Element {
  //const navigate: NavigateFunction = useNavigate();
  const users: UseQueryResult<Array<{email: string}>> = useGetIdpUsers();

  return (
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
          users.data.map((user: {email: string}) => (
            <TableRow key={user.email} hover={true}>
              <TableCell>{user.email}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
