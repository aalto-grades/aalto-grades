// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, Formula, FormulaData, ParamsObject
} from 'aalto-grades-common/types';
import deepEqual from 'deep-equal';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, Step, StepLabel, Stepper,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState, JSX } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import AlertSnackbar from '../alerts/AlertSnackbar';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import FormulaSummary from './FormulaSummary';
import SelectFormula from './SelectFormula';
import SetFormulaParams from './SetFormulaParams';

import { useEditAttainment, UseEditAttainmentResult } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { Message, State } from '../../types';
import { sleep } from '../../utils';

const successMessage: Message = {
  msg: 'Formula and parameters set successfully.',
  severity: 'success'
};

export default function EditFormulaDialog(props: {
  handleClose: () => void,
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

  const navigate: NavigateFunction = useNavigate();

  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const [activeStep, setActiveStep]: State<number> = useState(0);

  // Error message in selection step
  const [formulaError, setFormulaError]: State<string> = useState('');

  const [formula, setFormula]: State<FormulaData | null> =
    useState<FormulaData | null>(null);

  const [params, setParams]: State<object | null> =
    useState<object | null>(null);

  const [childParams, setChildParams]: State<Map<string, object> | null> =
    useState<Map<string, object> | null>(null);

  const editAttainment: UseEditAttainmentResult = useEditAttainment({
    onSuccess: () => {
      snackPack.push(successMessage);
      close();
    }
  });

  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  const closeDuration: number = 800;

  function hasUnsavedChanges(): boolean {
    return Boolean(
      // Formula was changed
      formula?.id !== props.attainment.formula
      || (
        // Or the parameters were changed
        formula?.id !== Formula.Manual && params && childParams && !deepEqual(
          props.attainment.formulaParams,
          constructParamsObject()
        )
      )
    );
  }

  function clearParams(): void {
    setParams(null);
    setChildParams(null);
  }

  function handleBack(): void {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else if (hasUnsavedChanges()) {
      setShowDialog(true);
    } else {
      close();
    }
  }

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

  async function close(): Promise<void> {
    props.handleClose();

    // Wait until the dialog is no longer visible to reset its state for a
    // smoother user experience
    await sleep(closeDuration);

    setActiveStep(0);
    setFormulaError('');
    setFormula(null);
    setParams(null);
    setChildParams(null);
  }

  function constructParamsObject(): ParamsObject | undefined {
    return (formula?.id === Formula.Manual) ? undefined : {
      ...params,
      children: Array.from(childParams ? childParams.entries() : [])
    } as ParamsObject;
  }

  function handleSubmit(): void {
    props.attainment.formula = formula?.id;
    props.attainment.formulaParams = constructParamsObject();

    if (props.courseId && props.assessmentModelId) {
      editAttainment.mutate({
        courseId: props.courseId,
        assessmentModelId: props.assessmentModelId,
        attainment: props.attainment
      });
    } else if (props.attainmentTree && props.setAttainmentTree) {
      props.setAttainmentTree(structuredClone(props.attainmentTree));
      snackPack.push(successMessage);
      close();
    }
  }

  return (
    <>
      <AlertSnackbar snackPack={snackPack} />
      <UnsavedChangesDialog
        setOpen={setShowDialog}
        open={showDialog}
        handleDiscard={(): void => {
          if (props.courseId)
            navigate(`/course-view/${props.courseId}`);
          close();
        }}
      />
      <Dialog
        open={props.open}
        transitionDuration={{ exit: closeDuration }}
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
            (activeStep === 0 && props.attainment) && (
              <SelectFormula
                attainment={props.attainment}
                formula={formula}
                setFormula={setFormula}
                clearParams={clearParams}
                error={formulaError}
              />
            )
          }
          {
            (activeStep === 1 && props.attainment && formula) && (
              <SetFormulaParams
                attainment={props.attainment}
                formula={formula}
                params={params}
                setParams={setParams}
                childParams={childParams}
                setChildParams={setChildParams}
              />
            )
          }
          {
            (activeStep === 2 && formula && params && childParams) && (
              <FormulaSummary
                formula={formula}
                params={params}
                childParams={childParams}
                constructParamsObject={constructParamsObject}
              />
            )
          }
          <Box sx={{
            mx: 3, my: 1.5, alignSelf: 'flex-end', display: 'flex',
          }}>
            <Button
              sx={{ mr: 2 }}
              size='medium'
              variant='outlined'
              color={(activeStep <= 0 && hasUnsavedChanges()) ? 'error' : 'primary'}
              onClick={handleBack}
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
    </>
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
