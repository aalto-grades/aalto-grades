// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

function FormulaSelectionRoute(): JSX.Element {
  const [selectedAttainments, setSelectedAttainments] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState({});

  const value = useMemo(() => (
    { selectedAttainments, setSelectedAttainments,
      selectedFormula, setSelectedFormula
    }
  ), [selectedAttainments, selectedFormula]);

  return <Outlet context={value} />;
}

export default FormulaSelectionRoute;
