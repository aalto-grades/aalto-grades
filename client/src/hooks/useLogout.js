// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import userService from '../services/user';
import useAuth from './useAuth';

// custom hook for logout, used since no individual logout page will be created

const useLogout = () => {

  const { setAuth } = useAuth();
  
  const logout = async () => {

    setAuth({});

    try {

      await userService.logout();

    } catch (exception) {

      console.log(exception);
    }
  };
  return logout;
};

export default useLogout;