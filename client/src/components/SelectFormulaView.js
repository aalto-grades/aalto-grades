// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SelectFormulaForm from './select-formula-view/SelectFormulaForm';
import instancesService from '../services/instances';
import formulasService from '../services/formulas';
import dummyAssignments from '../dummy-data/dummyAssignments';
import dummyFormulas from '../dummy-data/dummyFormulas';

const SelectFormulaView = () => {
  const { instanceId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [formulas, setFormulas] = useState([]);

  useEffect(() => {
    // TODO: fetch assignments for course based on the instanceId
    //  -> how should this be done when instance info is in context?
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
    setAssignments(dummyAssignments);
    setFormulas(dummyFormulas);
  }, []);

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
        <SelectFormulaForm assignments={assignments} formulas={formulas} instanceId={instanceId} />
      </Box>
    </Box>

  );
};

export default SelectFormulaView;