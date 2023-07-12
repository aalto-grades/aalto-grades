// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NavigateFunction, Params, useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormulaParamsForm from './formula-params-view/FormulaParamsForm';

function FormulaParamsView(): JSX.Element {

  const { courseId, assessmentModelId }: Params = useParams();
  const navigate: NavigateFunction = useNavigate();

  function navigateToCourseView(): void {
    navigate(`/course-view/${courseId}`, { replace: true });
  }

  function navigateBack(): void {
    navigate(`/${courseId}/select-formula/${assessmentModelId}`, { replace: true });
  }

  return (
    <Box display="flex" justifyContent='center' alignItems='center' flexDirection='column'>
      <Box textAlign='left' alignItems='left'>
        <Typography variant="h1" sx={{ flexGrow: 1, my: 4 }}>
          Specify Formula Parameters
        </Typography>
        <Typography variant="h3" sx={{ flexGrow: 1, mb: 2 }}>
          Result: Course Total Grade
        </Typography>
        <FormulaParamsForm
          navigateToCourseView={navigateToCourseView}
          navigateBack={navigateBack}
        />
      </Box>
    </Box>

  );
}

export default FormulaParamsView;
