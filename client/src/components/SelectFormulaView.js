// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import SelectFormulaForm from './select-formula-view/SelectFormulaForm';
import instancesService from '../services/instances';

const SelectFormulaView = () => {
  const { instanceId } = useParams();
  const [instance, setInstance] = useState();

  useEffect(() => {
    // should this be fetched from sisu or database?
    instancesService.getSisuInstance(instanceId)
      .then((data) => {
        setInstance(data.instance);
      })
      .catch((e) => console.log(e.message));
  }, []);

  // how to get instance info if it is in context? How to differentiate between course total grade and assigment grade?

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <Typography variant="h3" component="div" sx={{ flexGrow: 1, mb: 4, textAlign: 'left' }}>
        Select Grading Formula
      </Typography>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 2, textAlign: 'left' }}>
        Result: Course Total Grade
      </Typography>
      <SelectFormulaForm instance={instance} />
    </Container>

  );
};

export default SelectFormulaView;