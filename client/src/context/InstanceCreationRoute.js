// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

// TODO ON INSTANCE CREATION END: EMPTY THIS CONTEXT?

export const InstanceCreationRoute = () => {
  const [addedAttainments, setAddedAttainments] = useState([]);
  const [courseType, setType]                   = useState('');
  const [startDate, setStartDate]               = useState('');
  const [endDate, setEndDate]                   = useState('');
  const [teachers, setTeachers]                 = useState([]);
  const [stringMinCredits, setMinCredits]       = useState('');
  const [stringMaxCredits, setMaxCredits]       = useState('');
  const [gradingScale, setGradingScale]         = useState('');

  const value = useMemo(() => (
    { addedAttainments, setAddedAttainments,
      courseType, setType,
      startDate, setStartDate,
      endDate, setEndDate,
      teachers, setTeachers,
      stringMinCredits, setMinCredits,
      stringMaxCredits, setMaxCredits,
      gradingScale, setGradingScale,
    }
  ), [courseType, startDate, endDate, teachers, stringMinCredits, stringMaxCredits, gradingScale, addedAttainments]);

  return <Outlet context={value} />;
};

export default InstanceCreationRoute;