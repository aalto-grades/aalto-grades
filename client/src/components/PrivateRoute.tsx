// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// Used to determine if a user is authenticated and if they are allowed to access a page
// if not, the user is redirected to the login page

import {type JSX, useEffect, useState} from 'react';
import {Navigate, Outlet} from 'react-router-dom';

import type {SystemRole} from '@/common/types';
import {useGetRefreshToken} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';

type PropsType = {children?: JSX.Element; roles: SystemRole[]};
const PrivateRoute = ({children, roles}: PropsType): JSX.Element | null => {
  const {auth, setAuth, isTeacherInCharge} = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useGetRefreshToken();

  useEffect(() => {
    if (!refresh.isLoading) {
      if (refresh.data) setAuth(refresh.data);
      setLoading(false);
    }
  }, [refresh, setAuth]);

  // Only load page after token has been retrieved
  if (loading) return null;

  // If auth is not null -> token exists
  if (auth === null) return <Navigate to="/login" />;

  // Check if role is in the list of authorized roles or teacher in charge.
  if (!roles.includes(auth.role) && !isTeacherInCharge)
    return <Navigate to="/" />;

  return children ?? <Outlet />;
};

export default PrivateRoute;
