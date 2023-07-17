// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import userServices from '../services/user';
import useAuth, { AuthContextType } from './useAuth';

// custom hook for logout, used since no individual logout page will be created

function useLogout(): () => Promise<void> {

  const { setAuth }: AuthContextType = useAuth();

  async function logout(): Promise<void> {
    try {
      await userServices.logout();
      setAuth(null);
    } catch (exception) {
      console.log(exception);
    }
  }
  return logout;
}

export default useLogout;
