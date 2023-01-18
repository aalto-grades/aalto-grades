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

const PrivateRoute = ({ children }) => {

  let [loading, setLoading] = useState(true);
  const { auth, setAuth } = useAuth();

  const getAuthStatus = async () => {
    await setLoading(true);
    try {
      const response = await userService.getRefreshToken();

      setAuth({ role: response.role });
    }
    catch (exception) {
      console.error(exception);
    }
    finally {
      setLoading(false);
    }
  };

  const isAuthenticated = async () => {
    await getAuthStatus();
  };

  useEffect(() => {
    isAuthenticated();
  }, []);

  if (!loading) {
    console.log(auth.role);
    if(auth.role) {
      return (
        <>
          {children}
          <Outlet />
        </>
      );
    } else {
      return <Navigate to='/login' />;
    }
  }
};

PrivateRoute.propTypes = {
  children: PropTypes.element
};

export default PrivateRoute;
