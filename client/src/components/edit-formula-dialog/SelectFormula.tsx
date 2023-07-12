// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect, SyntheticEvent } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Typography, FormHelperText
} from '@mui/material';
import StyledBox from './StyledBox';
import ViewFormulaAccordion from './ViewFormulaAccordion';
import AlertSnackbar from '../alerts/AlertSnackbar';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import useSnackPackAlerts from '../../hooks/useSnackPackAlerts';
import formulaServices from '../../services/formulas';
import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { State } from '../../types';

function SelectFormulaForm(props: {
  attainment: AttainmentData,
  formula: FormulaData | null,
  setFormula: (formula: FormulaData) => void,
  navigateToAttributeSelection: () => void
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  const [formulaError, setFormulaError]: State<string> = useState('');
  const [setSnackPack, messageInfo, setMessageInfo, alertOpen, setAlertOpen] = useSnackPackAlerts();
  const [formulas, setFormulas]: State<Array<FormulaData>> = useState<Array<FormulaData>>([]);
  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  useEffect(() => {
    if (formulas.length == 0) {
      formulaServices.getFormulas()
        .then((data: Array<FormulaData>) => {
          setFormulas(data);
        })
        .catch((exception: Error) => console.log(exception.message));
    }
  }, []);

  function handleFormulaChange(event: /*SelectChangeEvent*/any): void {
    const newFormula: FormulaData | undefined = formulas.find(
      (formula: FormulaData) => formula.name == event.target.value
    );

    if (newFormula)
      props.setFormula(newFormula);
  }

  // checks that user has selected a function and at least one attainment
  // if not, shows error message
  function canBeSubmitted(): boolean {
    if (props.formula?.name === undefined) {
      setFormulaError('You must select a formula');
      return false;
    } else {
      setFormulaError('');
      return true;
    }
  }

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    if (canBeSubmitted()) {
      try {
        if (props.formula?.id) {
          const formula: FormulaData =
            await formulaServices.getFormulaDetails(props.formula.id);
          props.setFormula(formula);

          const updatedAttainments: any = props.attainment?.subAttainments?.map(
            (attainment: AttainmentData) => {
              const attributeObj: object = {};
              formula.params.forEach((elem: string) => {
                (attributeObj as any)[elem] = '';
              });
              return {
                ...attainment,
                affectCalculation: true,
                formulaAttributes: attributeObj
              };
            }
          );

          // TODO: send formula to database
          // TODO: add updated attainments to database
          console.log(updatedAttainments);
        }
      } catch (exception) {
        console.log(exception);
        setSnackPack((prev) => [...prev,
          { msg: 'Saving the formula failed.', severity: 'error' }
        ]);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <AlertSnackbar
        messageInfo={messageInfo}
        setMessageInfo={setMessageInfo}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      <StyledBox sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        p: 1,
        my: 3,
        textAlign: 'left'
      }}>
        <FormControl sx={{ m: 3, mt: 3, minWidth: 280 }} variant='standard'>
          <InputLabel
            id='formulaLabel'
            shrink={true}
            sx={{ fontSize: 'h3.fontSize', mb: -2, position: 'relative' }}
          >
            Formula
          </InputLabel>
          {
            formulas.length !== 0 ?
              <Select
                label='Formula'
                labelId='formulaSelector'
                value={props.formula?.name ?? ''}
                onChange={handleFormulaChange}
                error={formulaError !== ''}
              >
                {formulas.map((formula: FormulaData) => {
                  return (
                    <MenuItem key={formula.id} value={formula.name}>{formula.name}</MenuItem>
                  );
                })}
              </Select>
              :
              <CircularProgress sx={{ mt: 2 }} />
          }
          <FormHelperText error={formulaError !== ''}>{formulaError}</FormHelperText>
        </FormControl>
        <StyledBox>
          <ViewFormulaAccordion formulaId={props.formula?.id ?? null} />
        </StyledBox>
        <StyledBox sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
          <Typography width={320} sx={{ m: 3, mb: 1.5 }}>
            Specify attribute values for the sub study attainments
          </Typography>
          <Box sx={{
            mx: 3, mt: 0, mb: 1.5, alignSelf: 'flex-end',
            display: 'flex', lexDirection: 'column',
          }}>
            <Button
              sx={{ mr: 2 }}
              size='medium'
              variant='outlined'
              onClick={(): void => {
                if (props.formula?.id) {
                  setShowDialog(true);
                } else {
                  navigate(-1);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              size='medium'
              variant='contained'
              onClick={(): void => {
                if (canBeSubmitted())
                  props.navigateToAttributeSelection();
              }}
            >
              Specify attributes
            </Button>
          </Box>
        </StyledBox>
      </StyledBox>
      <UnsavedChangesDialog
        setOpen={setShowDialog}
        open={showDialog}
        navigateDir={'/course-view/'}
      />
    </form>
  );
}

SelectFormulaForm.propTypes = {
  attainment: PropTypes.object,
  formula: PropTypes.object,
  formulaData: PropTypes.func,
  navigateToAttributeSelection: PropTypes.func
};

export default SelectFormulaForm;
