// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, JSX } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, Step, StepLabel, Stepper
} from '@mui/material';
import SelectFormula from './SelectFormula';
import SetFormulaParams from './SetFormulaParams';
import attainmentServices from '../../services/attainments';
import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { State } from '../../types';

function EditFormulaDialog(props: {
  handleClose: () => void,
  open: boolean,
  courseId?: number,
  assessmentModelId?: number,
  attainment: AttainmentData,
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
    props.attainment.formula = formula?.id;
    props.attainment.formulaParams = {
      ...params,
      children: Array.from(childParams.entries())
    };

    if (props.courseId && props.assessmentModelId) {
      attainmentServices.editAttainment(
        props.courseId, props.assessmentModelId, props.attainment
      )
        .then(() => props.handleClose())
        .catch((e: Error) => console.log(e.message));
    } else if (props.attainmentTree && props.setAttainmentTree) {
      props.setAttainmentTree(structuredClone(props.attainmentTree));
      props.handleClose();
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
        <Stepper activeStep={activeStep}>
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
        <Box sx={{
          mx: 3, mt: 0, mb: 1.5, alignSelf: 'flex-end', display: 'flex',
        }}>
          {
            (activeStep > 0)
              ?
              <Button
                sx={{ mr: 2 }}
                size='medium'
                variant='outlined'
                onClick={() => setActiveStep(activeStep - 1)}
              >
                Back
              </Button>
              :
              <Button
                sx={{ mr: 2 }}
                size='medium'
                variant='outlined'
                onClick={props.handleClose}
              >
                Cancel
              </Button>
          }
          {
            (activeStep < 2)
              ?
              <Button
                size='medium'
                variant='contained'
                onClick={handleNext}
              >
                Next
              </Button>
              :
              <Button
                size='medium'
                variant='contained'
                onClick={handleSubmit}
              >
                Submit
              </Button>
          }
        </Box>
      </DialogContent>
    </Dialog>
  );
}

EditFormulaDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  courseId: PropTypes.number,
  assessmentModelId: PropTypes.number,
  attainment: PropTypes.object,
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func
};

export default EditFormulaDialog;
