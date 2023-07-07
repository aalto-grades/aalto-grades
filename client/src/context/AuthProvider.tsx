// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Context, createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { LoginResult } from 'aalto-grades-common/types';
import { State } from '../types';

export interface AuthContextType {
  auth: LoginResult | null,
  setAuth?: (auth: LoginResult | null) => void
}

const AuthContext: Context<AuthContextType> = createContext<AuthContextType>({ auth: null });

export function AuthProvider(params: {
  children: JSX.Element
}): JSX.Element {
  const [auth, setAuth]: State<LoginResult | null> = useState<LoginResult | null>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {params.children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.element
};

export default AuthContext;
