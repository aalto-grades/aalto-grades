// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { LoginResult } from 'aalto-grades-common/types/auth';

const AuthContext = createContext<{
  auth?: LoginResult,
  setAuth?: (auth: LoginResult) => void
}>({});

export const AuthProvider = ({ children }: {
  children: JSX.Element
}): JSX.Element => {
  const [auth, setAuth] = useState<LoginResult>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.element
};

export default AuthContext;
