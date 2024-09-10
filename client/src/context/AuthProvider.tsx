// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type JSX,
  type PropsWithChildren,
  createContext,
  useMemo,
  useState,
} from 'react';

import type {AuthData} from '@/common/types';

/**
 * AuthContext stores both the users authentication information and is the user
 * teacher in charge on the currently selected course.
 */
export type AuthContextType = {
  auth: AuthData | null;
  setAuth: (auth: AuthData | null) => void;
  isTeacherInCharge: boolean;
  setIsTeacherInCharge: (isTeacherInCharge: boolean) => void;
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

  const authData = useMemo(
    () => ({
      auth,
      setAuth,
      isTeacherInCharge,
      setIsTeacherInCharge,
      isAssistant,
      setIsAssistant,
    }),
    [auth, isAssistant, isTeacherInCharge]
  );
  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
