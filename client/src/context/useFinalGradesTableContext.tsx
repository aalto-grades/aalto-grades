// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {useContext} from 'react';

import {
  FinalGradesTableContext,
  type FinalGradesTableContextProps,
} from './FinalGradesTableProvider';

export const useFinalGradesTableContext =
  (): FinalGradesTableContextProps => {
    const context = useContext(FinalGradesTableContext);
    if (context === null) {
      throw new Error(
        'useFinalGradesTableContext must be used within a FinalGradesTableProvider'
      );
    }
    return context;
  };
