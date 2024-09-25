// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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
import {enqueueSnackbar} from 'notistack';
import {type JSX, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';

import type {UserData} from '@/common/types';
import {useDeleteUser, useGetUsers} from '@/hooks/useApi';
import type {HeadCellData} from '@/types';
import ResetAuthDialog from './ResetAuthDialog';

const UsersTable = (): JSX.Element => {
  const {t} = useTranslation();
  const users = useGetUsers();
  const deleteUser = useDeleteUser();
  const [tab, setTab] = useState<number>(0);
  const [toBeReset, setToBeReset] = useState<UserData | null>(null);

  const headCells: HeadCellData[] = [
    {id: 'email', label: t('general.email')},
    {id: 'actions', label: ''},
  ];

  const shownUsers = useMemo(() => {
    if (users.data === undefined) return [];
    if (tab === 0) return users.data.filter(user => user.idpUser);
    return users.data.filter(user => user.admin);
  }, [tab, users.data]);

  const handleDeleteUser = async (user: UserData): Promise<void> => {
    const confirmation = await AsyncConfirmationModal({
      title: t('front-page.delete-user'),
      message: t('front-page.delete-user-message', {user: user.email}),
      confirmDelete: true,
    });
    if (confirmation) {
      await deleteUser.mutateAsync(user.id);
      enqueueSnackbar(t('front-page.user-deleted'), {variant: 'success'});
    }
  };

  if (users.data?.length === 0 && users.isFetched)
    return <>{t('front-page.no-users')}</>;

  return (
    <>
      <ResetAuthDialog
        open={toBeReset !== null}
        onClose={() => setToBeReset(null)}
        user={toBeReset}
      />

      <Tabs
        value={tab}
        onChange={(_, newTab: number) => setTab(newTab)}
        sx={{width: 'fit-content' /* Fix buttons not being clickable */}}
      >
        <Tab label={t('general.idp-users')} sx={{textTransform: 'none'}} />
        <Tab label={t('general.admins')} sx={{textTransform: 'none'}} />
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
              <TableRow key={user.email} hover>
                <TableCell sx={{width: '75%'}}>{user.email}</TableCell>
                <TableCell>
                  <Tooltip
                    title={t('front-page.reset-password-mfa')}
                    placement="top"
                  >
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
                  <Tooltip title={t('front-page.delete-user')} placement="top">
                    <span>
                      <IconButton
                        aria-label="delete"
                        onClick={async () => handleDeleteUser(user)}
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
