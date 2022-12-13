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

const PrivateRoute = ({ children }) => {

  const { auth, setAuth } = useAuth();

  const validateRefreshToken = async () => {
    try {
      const response = await userService.getRefreshToken();
      console.log(response);

      setAuth({ userId: response.id, role: response.role });

      return true;
    } catch (exception) {
      return false;
    }
  };
  if (auth?.role) {
    // if role is found in context, check if previous login was still valid

    if(validateRefreshToken()) {
      // if refresh token is valid, let user access the page
      return (
        <>
          {children}
          <Outlet />
        </>
      );
    }
  }
  // navigate to login if role is not found and no valid refresh token
  return <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.element
};

export default PrivateRoute;
