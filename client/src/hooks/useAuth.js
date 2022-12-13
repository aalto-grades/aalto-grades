// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useContext, useDebugValue } from 'react';
import AuthContext from '../context/authProvider';

// custom hook for using the authProvider context and for printing out debug information

const useAuth = () => {
  const { auth } = useContext(AuthContext);

  // debug indormation is displayed within the react dev tools
  useDebugValue(auth, auth => auth?.user ? auth?.user : 'No user');

  return useContext(AuthContext);
};

export default useAuth;