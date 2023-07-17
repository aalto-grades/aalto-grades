// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useContext, useDebugValue } from 'react';

import AuthContext, { AuthContextType } from '../context/AuthProvider';

// custom hook for using the authProvider context and for printing out debug information

function useAuth(): AuthContextType {
  const { auth }: AuthContextType = useContext(AuthContext);

  // debug information is displayed within the react dev tools
  useDebugValue(auth, auth => auth ? 'Logged In' : 'Logged Out');
  return useContext(AuthContext);
}

export type { AuthContextType } from '../context/AuthProvider';
export default useAuth;
