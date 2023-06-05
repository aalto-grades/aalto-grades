// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormulaAttributesForm from './formula-attributes-view/FormulaAttributesForm';

const FormulaAttributesView = () => {
  
  const { courseId, instanceId } = useParams();
  const navigate = useNavigate();

  const navigateToCourseView = () => {
    navigate(`/course-view/${courseId}`, { replace: true });
  };

  const navigateBack = () => {
    navigate(`/${courseId}/select-formula/${instanceId}`, { replace: true });
  };

  // TODO: How to differentiate between course total grade and assigment grade?

  return (
    <Box display="flex" justifyContent='center' alignItems='center' flexDirection='column'>
      <Box textAlign='left' alignItems='left'>
        <Typography variant="h1" sx={{ flexGrow: 1, my: 4 }}>
          Specify Formula Attributes
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 2 }}>
          Result: Course Total Grade
        </Typography>
        <FormulaAttributesForm navigateToCourseView={navigateToCourseView} navigateBack={navigateBack}/>
      </Box>
    </Box>

  );
};

export default FormulaAttributesView;