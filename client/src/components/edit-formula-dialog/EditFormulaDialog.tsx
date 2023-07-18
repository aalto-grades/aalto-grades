// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula, FormulaData } from 'aalto-grades-common/types';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, Step, StepLabel, Stepper,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState, JSX } from 'react';

import SelectFormula from './SelectFormula';
import SetFormulaParams from './SetFormulaParams';

//import { editAttainment } from '../../services/attainments';
import { State } from '../../types';

export default function EditFormulaDialog(props: {
  handleClose: () => void,
  onSubmit: () => void,
  open: boolean,
  // courseId and assessmentModelId are needed when editing from CourseView
  courseId?: number,
  assessmentModelId?: number,
  attainment: AttainmentData,
  // attainmentTree and setAttainmentTree are needed when editing from
  // EditAttainmentView
  attainmentTree?: AttainmentData,
  setAttainmentTree?: (attainmentTree: AttainmentData) => void
}): JSX.Element {

  const [activeStep, setActiveStep]: State<number> = useState(0);

  // Error message in selection step
  const [formulaError, setFormulaError]: State<string> = useState('');

  const [formula, setFormula]: State<FormulaData | null> =
    useState<FormulaData | null>(null);
  const [params, setParams]: State<object> = useState({});
  const [childParams, setChildParams]: State<Map<string, object>> =
    useState<Map<string, object>>(new Map());

  function handleNext(): void {
    if (activeStep === 0) {
      if (formula) {
        setFormulaError('');
      } else {
        setFormulaError('You must select a formula');
        return;
      }
    }

    setActiveStep(activeStep + 1);
  }

  function handleSubmit(): void {
    function close(): void {
      props.onSubmit();
      props.handleClose();

      setActiveStep(0);
      setFormulaError('');
      setFormula(null);
      setParams({});
      setChildParams(new Map());
    }

    props.attainment.formula = formula?.id;
    props.attainment.formulaParams = (formula?.id === Formula.Manual) ? undefined : {
      ...params,
      children: Array.from(childParams.entries())
    };

    if (props.courseId && props.assessmentModelId) {
      /*editAttainment(
        props.courseId, props.assessmentModelId, props.attainment
      )
        .then(() => close())
        .catch((e: Error) => console.log(e.message));*/
    } else if (props.attainmentTree && props.setAttainmentTree) {
      props.setAttainmentTree(structuredClone(props.attainmentTree));
      close();
    }
  }

  return (
    <Dialog
      open={props.open}
      transitionDuration={{ exit: 800 }}
      maxWidth={'xl'}
    >
      <DialogTitle>Formula</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Select Formula</StepLabel>
          </Step>
          <Step>
            <StepLabel>Set Parameters</StepLabel>
          </Step>
        </Stepper>
        {
          (activeStep === 0 && props.attainment) &&
          <SelectFormula
            formula={formula}
            setFormula={setFormula}
            error={formulaError}
          />
        }
        {
          (activeStep === 1 && props.attainment && formula) &&
          <SetFormulaParams
            attainment={props.attainment}
            formula={formula}
            params={params}
            setParams={setParams}
            childParams={childParams}
            setChildParams={setChildParams}
          />
        }
        {
          (activeStep === 2 && formula) &&
          <Box sx={{ p: 1 }}>
            <Box sx={{
              display: 'flex'
            }}>
              <Typography sx={{ mr: 1 }}>
                {formula.name}
              </Typography>
              <code>
                {JSON.stringify(params)}
              </code>
            </Box>
            {
              Array.from(childParams.entries()).map(
                (childParam: [string, object]) => {
                  return (
                    <Box key={childParam[0]} sx={{
                      display: 'flex',
                      mt: 1
                    }}>
                      <Typography sx={{ mr: 1 }}>
                        {childParam[0]}
                      </Typography>
                      <code>
                        {JSON.stringify(childParam[1])}
                      </code>
                    </Box>
                  );
                }
              )
            }
          </Box>
        }
        <Box sx={{
          mx: 3, my: 1.5, alignSelf: 'flex-end', display: 'flex',
        }}>
          <Button
            sx={{ mr: 2 }}
            size='medium'
            variant='outlined'
            onClick={
              (activeStep > 0)
                ? (): void => setActiveStep(activeStep - 1)
                : props.handleClose
            }
          >
            {(activeStep > 0) ? 'Back' : 'Cancel'}
          </Button>
          <Button
            sx={{ mr: 2 }}
            size='medium'
            variant='contained'
            onClick={
              (activeStep < 2)
                ? handleNext
                : handleSubmit
            }
          >
            {(activeStep < 2) ? 'Next' : 'Submit'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

EditFormulaDialog.propTypes = {
  handleClose: PropTypes.func,
  onSubmit: PropTypes.func,
  open: PropTypes.bool,
  courseId: PropTypes.number,
  assessmentModelId: PropTypes.number,
  attainment: PropTypes.object,
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func
};
