// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, JSX } from 'react';
import {
  useParams, useNavigate, Params, NavigateFunction
} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, Step, StepLabel, StepContent, Stepper
} from '@mui/material';
import SelectFormula from './SelectFormula';
import FormulaParamsForm from './FormulaParamsForm';
import formulaServices from '../../services/formulas';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { State } from '../../types';

function EditFormulaDialog(props: {
  handleClose: () => void,
  open: boolean,
  attainment: AttainmentData
}): JSX.Element {

  const navigate: NavigateFunction = useNavigate();
  const { courseId, assessmentModelId }: Params = useParams();

  const [activeStep, setActiveStep]: State<number> = useState(0);

  const [formula, setFormula]: State<FormulaData | null> =
    useState<FormulaData | null>(null);
  const [setSnackPack]: SnackPackAlertState = useSnackPackAlerts();

  function navigateToAttributeSelection(): void {
    if (formula) {
      formulaServices.getFormulaDetails(formula.id).then((formula: FormulaData) => {
        setFormula(formula);
        navigate(`/${courseId}/formula-params/${assessmentModelId}`, { replace: true });
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
            <StepContent>
              {
                props.attainment &&
                <SelectFormula
                  attainment={props.attainment}
                  navigateToAttributeSelection={navigateToAttributeSelection}
                />
              }
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Set Parameters</StepLabel>
            <StepContent>
              {
                (props.attainment && formula) &&
                <FormulaParamsForm
                  attainment={props.attainment}
                  formula={formula}
                />
              }
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
}

EditFormulaDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  attainment: PropTypes.object
};

export default EditFormulaDialog;
