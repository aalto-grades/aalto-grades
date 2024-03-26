// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// Used to determine if a user is authenticated and if they are allowed to access a page
// if not, the user is redirected to the login page

import {LoginResult, SystemRole} from '@common/types';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useEffect, useState} from 'react';
import {Navigate, Outlet} from 'react-router-dom';

import {useGetRefreshToken} from '../../hooks/useApi';
import useAuth, {AuthContextType} from '../../hooks/useAuth';
import {State} from '../../types';

export default function PrivateRoute(props: {
  children?: JSX.Element;
  roles: Array<SystemRole>;
}): JSX.Element | null {
  const {auth, setAuth, isTeacherInCharge}: AuthContextType = useAuth();
  const [loading, setLoading]: State<boolean> = useState(true);

  const refresh: UseQueryResult<LoginResult> = useGetRefreshToken();

  useEffect(() => {
    if (!refresh.isLoading) {
      if (refresh.data) setAuth(refresh.data);
      setLoading(false);
    }
  }, [refresh.data, refresh.isLoading, setAuth]);

  // Only load page after token has been retrieved
  if (loading) return null;

  // If auth is not null -> token exists
  if (auth === null) return <Navigate to="/login" />;

  // Check if role is in the list of authorised roles or teacher in charge.
  if (!props.roles.includes(auth.role) && !isTeacherInCharge)
    return <Navigate to="/" />;

  return <>{props.children ? props.children : <Outlet />}</>;
}
