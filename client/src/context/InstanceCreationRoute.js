// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

const dummyTeachers = ['Elisa Mekler (you)', 'David McGookin'];
const dummyInfo = { startDate: new Date(2021, 8, 14), endDate: new Date(2021, 11, 13), type: 'Lecture', minCredits: 5, maxCredits: 5, scale: 'General scale, 0-5', teachers: dummyTeachers };

export const InstanceCreationRoute = () => {
  const [addedAssignments, setAddedAssignments]   = useState([]);
  const [courseType, setType]           = useState(dummyInfo.type);
  const [startDate, setStartDate]       = useState(dummyInfo.startDate);
  const [endDate, setEndDate]           = useState(dummyInfo.endDate);
  const [teachers, setTeachers]         = useState(dummyInfo.teachers);
  const [minCredits, setMinCredits]     = useState(dummyInfo.minCredits);
  const [maxCredits, setMaxCredits]     = useState(dummyInfo.maxCredits);
  const [gradingScale, setGradingScale] = useState(dummyInfo.scale);

  const value = useMemo(() => (
    { addedAssignments, setAddedAssignments,
      courseType, setType,
      startDate, setStartDate,
      endDate, setEndDate,
      teachers, setTeachers,
      minCredits, setMinCredits,
      maxCredits, setMaxCredits,
      gradingScale, setGradingScale,
    }
  ), [courseType, startDate, endDate, teachers, minCredits, maxCredits, gradingScale, addedAssignments]);

  return <Outlet context={value} />;
};

export default InstanceCreationRoute;