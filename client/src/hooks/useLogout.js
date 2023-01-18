// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import userService from '../services/user';
import useAuth from './useAuth';

const useLogout = () => {

  const { setAuth } = useAuth();
  
  const logout = async () => {

    setAuth({});

    try {
      const response = await userService.logout();
    
      console.log(response);
    
    } catch (exception) {
      console.log(exception);
    }
  };

  return logout;
};

export default useLogout;