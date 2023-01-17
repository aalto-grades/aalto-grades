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
  //const [isLoading, setIsLoading] = useState(true);
  let [loading, setLoading] = useState(true);
  const { auth, setAuth } = useAuth();

  /*useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        setLoading(true);
        const response = await userService.getRefreshToken();
        //setAuth({ userId: response.id, role: response.role });
        setAuth({ role: response.role });
      }
      catch (exception) {
        console.error(exception);
      }
      finally {
        isMounted && setIsLoading(false);
      }
    };
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => isMounted = false;
  }, []);*/
  async function getAuthStatus() {
    await setLoading(true);
    try {
      const response = await userService.getRefreshToken();
      //setAuth({ userId: response.id, role: response.role });
      setAuth({ role: response.role });
    }
    catch (exception) {
      console.error(exception);
    }
    finally {
      setLoading(false);
    }
  }

  async function isAuthenticated() {
    await getAuthStatus();
  }

  useEffect(() => {
    isAuthenticated();
  }, []);

  if (!loading) {
    console.log(loading);
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
