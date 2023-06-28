// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import {
  useParams, useNavigate, useOutletContext, Params, NavigateFunction
} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SelectFormulaForm from './select-formula-view/SelectFormulaForm';
import formulasService from '../services/formulas';
import mockAttainments from '../tests/mock-data/mockAttainments';
import { State } from '../types';
import { FormulaPreview } from 'aalto-grades-common/types';
import useSnackPackAlerts from '../hooks/useSnackPackAlerts';

function SelectFormulaView(): JSX.Element {
  const { setSelectedFormula, selectedFormula } = useOutletContext<any>();
  const { instanceId, courseId }: Params = useParams();
  const [attainments, setAttainments]: State<Array<any>> = useState([]);
  const navigate: NavigateFunction = useNavigate();
  const [setSnackPack] = useSnackPackAlerts();

  useEffect(() => {
    // TODO: fetch attainments for course based on the assessmentModelId
    /*
    instancesService.getAttainments(instanceId)
      .then((data: any) => {
        setAttainments(data);
      })
      .catch((exception: Error) => console.log(exception.message));
    */
    // TODO remove mock attainments import after this route works.
    setAttainments(mockAttainments);
  }, []);

  function navigateToCourseView(): void {
    navigate(`/course-view/${courseId}`, { replace: true });
  }

  function navigateToAttributeSelection(): void {
    formulasService.getFormulaDetails(selectedFormula.id).then((formula: FormulaPreview) => {
      setSelectedFormula(formula);
      navigate(`/${courseId}/formula-attributes/${instanceId}`, { replace: true });
    }).catch((exception: Error) => {
      console.log(exception.message);

      setSnackPack((prev: any) => [
        ...prev,
        {
          msg: exception.message,
          severity: 'error'
        }
      ]);
    });
  }

  // TODO: How to differentiate between course total grade and assigment grade?

  return (
    <Box display="flex" justifyContent='center' alignItems='center' flexDirection='column'>
      <Box textAlign='left' alignItems='left'>
        <Typography variant="h1" sx={{ flexGrow: 1, my: 4 }}>
          Select Grading Formula
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 2 }}>
          Result: Course Total Grade
        </Typography>
        <SelectFormulaForm
          attainments={attainments}
          navigateToCourseView={navigateToCourseView}
          navigateToAttributeSelection={navigateToAttributeSelection}
        />
      </Box>
    </Box>

  );
}

export default SelectFormulaView;
