// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useContext, useDebugValue} from 'react';

import AuthContext, {AuthContextType} from '@/context/AuthProvider';

// custom hook for using the authProvider context and for printing out debug information
const useAuth = (): AuthContextType => {
  const {auth} = useContext(AuthContext);

  // debug information is displayed within the react dev tools
  useDebugValue(auth, authResult => (authResult ? 'Logged in' : 'Logged out'));
  return useContext(AuthContext);
};

export default useAuth;
export type {AuthContextType} from '@/context/AuthProvider';
