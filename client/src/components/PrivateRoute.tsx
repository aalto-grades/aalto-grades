// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, CircularProgress} from '@mui/material';
import {type JSX, Suspense, useEffect} from 'react';
import {Navigate, Outlet} from 'react-router-dom';

import type {SystemRole} from '@/common/types';
import {useGetRefreshTokenSuspense} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';

type PropsType = {children?: JSX.Element; roles: SystemRole[]};

const LoadingFallback = (): JSX.Element => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

/**
 * Inner component that handles authentication logic after data is loaded
 */
const PrivateRouteInner = ({children, roles}: PropsType): JSX.Element => {
  const {setAuth, isTeacherInCharge} = useAuth();
  const refresh = useGetRefreshTokenSuspense();

  useEffect(() => {
    if (refresh.data) {
      setAuth(refresh.data);
    }
  }, [refresh.data, setAuth]);

  // Use refresh.data directly instead of auth from context
  // If refresh.data is null -> no valid token exists
  if (refresh.data === null) return <Navigate to="/login" />;

  // Check if role is in the list of authorized roles or teacher in charge.
  if (!roles.includes(refresh.data.role) && !isTeacherInCharge)
    return <Navigate to="/" />;

  return children ?? <Outlet />;
};

/**
 * Used to determine if a user is authenticated and if they are allowed to
 * access a page if not, the user is redirected to the login page.
 */
const PrivateRoute = (props: PropsType): JSX.Element => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PrivateRouteInner {...props} />
    </Suspense>
  );
};

export default PrivateRoute;
