// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

const FormulaSelectionRoute = () => {
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [selectedFormula, setSelectedFormula] = useState({});

  const value = useMemo(() => (
    { selectedAssignments, setSelectedAssignments,
      selectedFormula, setSelectedFormula
    }
  ), [selectedAssignments, selectedFormula]);

  return <Outlet context={value} />;
};

export default FormulaSelectionRoute;