// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormulaAttributesForm from './formula-attributes-view/FormulaAttributesForm';
import instancesService from '../services/instances';
import mockAssignments from '../mock-data/mockAssignments';
import mockFormulas from '../mock-data/mockFormulas';

const FormulaAttributesView = () => {
  const { instanceId, courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: fetch assignments for course based on the instanceId
    //  -> how should this be done when instance info is in context?
    instancesService.getAssignments(instanceId)
      .then((data) => {
        setAssignments(data);
      })
      .catch((e) => console.log(e.message));
    // TODO: fetch formulas
    // DELETE THIS AFTER ROUTES WORK!
    setAssignments(mockAssignments);
  }, []);

  const navigateToCourseView = () => {
    navigate(`/course-view/${courseId}`, { replace: true });
  };

  // TODO: How to differentiate between course total grade and assigment grade?

  return (
    <Box display="flex" justifyContent='center' alignItems='center' flexDirection='column'>
      <Box textAlign='left' alignItems='left'>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, my: 4 }}>
          Specify Formula Attributes
        </Typography>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 2 }}>
          Result: Course Total Grade
        </Typography>
        <FormulaAttributesForm assignments={assignments} navigateToCourseView={navigateToCourseView} formula={mockFormulas[0]} />
      </Box>
    </Box>

  );
};

export default FormulaAttributesView;