// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SelectFormulaForm from './select-formula-view/SelectFormulaForm';
import instancesService from '../services/instances';
import formulasService from '../services/formulas';
import mockAssignments from '../mock-data/mockAssignments';
import mockFormulas from '../mock-data/mockFormulas';

const SelectFormulaView = () => {
  const { instanceId, courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: fetch assignments for course based on the instanceId

    instancesService.getAssignments(instanceId)
      .then((data) => {
        setAssignments(data);
      })
      .catch((e) => console.log(e.message));
    // TODO: fetch formulas
    formulasService.getFormulas()
      .then((data) => {
        setFormulas(data);
      })
      .catch((e) => console.log(e.message));
    // DELETE THIS AFTER ROUTES WORK!
    setAssignments(mockAssignments);
    setFormulas(mockFormulas);
  }, []);

  const navigateToCourseView = () => {
    navigate(`/course-view/${courseId}`, { replace: true });
  };

  const navigateToAttributeSelection = () => {
    navigate(`/${courseId}/formula-attributes/${instanceId}`, { replace: true });
  };

  // TODO: How to differentiate between course total grade and assigment grade?

  return (
    <Box display="flex" justifyContent='center' alignItems='center' flexDirection='column'>
      <Box textAlign='left' alignItems='left'>
        <Typography variant="h3" component="div" sx={{ flexGrow: 1, my: 4 }}>
          Select Grading Formula
        </Typography>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 2 }}>
          Result: Course Total Grade
        </Typography>
        <SelectFormulaForm
          assignments={assignments}
          formulas={formulas}
          navigateToCourseView={navigateToCourseView} 
          navigateToAttributeSelection={navigateToAttributeSelection}
        />
      </Box>
    </Box>

  );
};

export default SelectFormulaView;