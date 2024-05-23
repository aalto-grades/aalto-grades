// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Context, createContext, JSX, useState} from 'react';

import {LoginResult} from '@/common/types';
import {State} from '../types';

/**
 * AuthContext stores both the users authentication information and is the user
 * teacher in charge on the currently selected course.
 */
export type AuthContextType = {
  auth: LoginResult | null;
  setAuth: (auth: LoginResult | null) => void;
  isTeacherInCharge: boolean;
  setIsTeacherInCharge: (isTeacherIncharge: boolean) => void;
  isAssistant: boolean;
  setIsAssistant: (isAssistant: boolean) => void;
};

const AuthContext: Context<AuthContextType> = createContext<AuthContextType>({
  auth: null,
  setAuth: () => console.error('Called empty setAuth()'),
  isTeacherInCharge: false,
  setIsTeacherInCharge: () =>
    console.error('Called empty setIsTeacherInCharge()'),
  isAssistant: false,
  setIsAssistant: () => console.error('Called empty setAssistant()'),
});

export function AuthProvider(params: {children: JSX.Element}): JSX.Element {
  const [auth, setAuth]: State<LoginResult | null> =
    useState<LoginResult | null>(null);
  const [isTeacherInCharge, setIsTeacherInCharge]: State<boolean> =
    useState(false);
  const [isAssistant, setIsAssistant]: State<boolean> = useState(false);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        isTeacherInCharge,
        setIsTeacherInCharge,
        isAssistant,
        setIsAssistant,
      }}
    >
      {params.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
