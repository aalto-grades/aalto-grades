// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// Used to determine if a user is authenticated and if they are allowed to access a page
// if not, the user is redirected to the login page

import { Navigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import userService from '../../services/user';
import { Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children, roles }) => {

  const [loading, setLoading] = useState(true);
  const { auth, setAuth } = useAuth();

  const getAuthStatus = async () => {
    // loading set to true so page doesn't load until token has been retrieved
    setLoading(true);
    try {
      const response = await userService.getRefreshToken();
      setAuth({ role: response.role });
    } catch (exception) {
      console.error(exception);
    } finally {
      // token has been retrieved, can load page
      setLoading(false);
    }
  };

  /*const isAuthenticated = async () => {
    await getAuthStatus();
  };*/

  useEffect(() => {
    getAuthStatus();
  }, []);

  // only load page after token has been retrieved
  if (!loading) {
    // if role can be found -> token exists
    if(auth.role) {
      // check if role is in the list of authorised roles
      if (roles.includes(auth.role)) {
        return (
          <>
            {children}
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
};

PrivateRoute.propTypes = {
  children: PropTypes.element,
  roles: PropTypes.array
};

export default PrivateRoute;
