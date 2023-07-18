// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// Used to determine if a user is authenticated and if they are allowed to access a page
// if not, the user is redirected to the login page

import { LoginResult, SystemRole } from 'aalto-grades-common/types';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import { useGetRefreshToken } from '../../hooks/useApi';
import useAuth, { AuthContextType } from '../../hooks/useAuth';

export default function PrivateRoute(props: {
  children?: JSX.Element,
  roles: Array<SystemRole>
}): JSX.Element | null {

  const { auth, setAuth, isTeacherInCharge }: AuthContextType = useAuth();

  const refresh: UseQueryResult<LoginResult> = useGetRefreshToken();

  // only load page after token has been retrieved
  if (!refresh.isLoading) {
    setAuth(refresh.data ?? null);

    // If auth is not null -> token exists
    if (auth) {
      // check if role is in the list of authorised roles or teacher in charge.
      if (props.roles.includes(auth.role) || isTeacherInCharge) {
        return (
          <>
            {props.children}
            <Outlet />
          </>
        );
      // if user is not authorised to access page -> redirect to front page
      } else {
        return <Navigate to='/' />;
      }
    // no role found -> no token -> redirect to login
    } else {
      return <Navigate to='/login' />;
    }
  }

  return null;
}

PrivateRoute.propTypes = {
  children: PropTypes.element,
  roles: PropTypes.array
};
