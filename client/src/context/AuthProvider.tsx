// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Context, createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { LoginResult } from 'aalto-grades-common/types';
import { State } from '../types';

/**
 * AuthContext stores both the users authentication information and
 * is the user teacher in charge on the currently selected course.
 */
export interface AuthContextType {
  auth?: LoginResult,
  setAuth?: (auth: LoginResult) => void,
  isTeacherInCharge?: boolean
  setIsTeacherInCharge?: (isTeacherIncharge: boolean) => void
}

const AuthContext: Context<AuthContextType> = createContext<AuthContextType>({});

export function AuthProvider(params: {
  children: JSX.Element
}): JSX.Element {
  const [auth, setAuth]: State<LoginResult> = useState<LoginResult>(null);
  const [isTeacherInCharge, setIsTeacherInCharge]: State<boolean> = useState(false);

  return (
    <AuthContext.Provider value={{ auth, setAuth, isTeacherInCharge, setIsTeacherInCharge }}>
      {params.children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.element
};

export default AuthContext;
