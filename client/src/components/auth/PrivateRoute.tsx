// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// Used to determine if a user is authenticated and if they are allowed to access a page
// if not, the user is redirected to the login page

import { LoginResult, SystemRole } from 'aalto-grades-common/types';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import useAuth, { AuthContextType } from '../../hooks/useAuth';
import { getRefreshToken } from '../../services/user';
import { State } from '../../types';

export default function PrivateRoute(props: {
  children?: JSX.Element,
  roles: Array<SystemRole>
}): JSX.Element | null {

  const [loading, setLoading]: State<boolean> = useState(true);
  const { auth, setAuth, isTeacherInCharge }: AuthContextType = useAuth();

  async function getAuthStatus(): Promise<void> {
    // loading set to true so page doesn't load until token has been retrieved
    setLoading(true);
    try {
      const result: LoginResult = await getRefreshToken();
      setAuth({
        id: result.id,
        role: result.role,
        name: result.name
      });
    } catch (exception) {
      console.error(exception);
    } finally {
      // token has been retrieved, can load page
      setLoading(false);
    }
  }

  useEffect(() => {
    getAuthStatus();
  }, []);

  // only load page after token has been retrieved
  if (!loading) {
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
