// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {createContext, JSX, PropsWithChildren, useState} from 'react';

import {AuthData} from '@/common/types';

/**
 * AuthContext stores both the users authentication information and is the user
 * teacher in charge on the currently selected course.
 */
export type AuthContextType = {
  auth: AuthData | null;
  setAuth: (auth: AuthData | null) => void;
  isTeacherInCharge: boolean;
  setIsTeacherInCharge: (isTeacherIncharge: boolean) => void;
  isAssistant: boolean;
  setIsAssistant: (isAssistant: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => console.error('Called empty setAuth()'),
  isTeacherInCharge: false,
  setIsTeacherInCharge: () =>
    console.error('Called empty setIsTeacherInCharge()'),
  isAssistant: false,
  setIsAssistant: () => console.error('Called empty setAssistant()'),
});

export const AuthProvider = ({children}: PropsWithChildren): JSX.Element => {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isTeacherInCharge, setIsTeacherInCharge] = useState<boolean>(false);
  const [isAssistant, setIsAssistant] = useState<boolean>(false);

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
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
