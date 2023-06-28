// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { NavigateFunction, useOutletContext, useNavigate } from 'react-router-dom';
import PropTypes, { InferProps } from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import StyledBox from './StyledBox';
import ViewFormulaAccordion from './ViewFormulaAccordion';
import AlertSnackbar from '../alerts/AlertSnackbar';
import useSnackPackAlerts from '../../hooks/useSnackPackAlerts';
import { sleep } from '../../utils';
import formulasService from '../../services/formulas';
import { FormulaData, FormulaPreview } from 'aalto-grades-common/types';
import CircularProgress from '@mui/material/CircularProgress';
import { State } from '../../types';

function SelectFormulaForm({
  attainments, navigateToCourseView, navigateToAttributeSelection
}: InferProps<typeof SelectFormulaForm.propTypes>): JSX.Element {
  const [checkboxError, setCheckboxError]: State<string>  = useState('');
  const [formulaError, setFormulaError]: State<string> = useState('');
  const [setSnackPack, messageInfo, setMessageInfo, alertOpen, setAlertOpen] = useSnackPackAlerts();
  const [formulas, setFormulas]: State<Array<FormulaData> | null> = useState(null);
  const navigate: NavigateFunction = useNavigate();

  const {
    selectedAttainments, setSelectedAttainments,
    selectedFormula, setSelectedFormula
  } = useOutletContext<any>();

  useEffect(() => {
    if (formulas == null) {
      formulasService.getFormulas()
        .then((data: Array<FormulaData>) => {
          setFormulas(data);
        })
        .catch((exception: Error) => console.log(exception.message));
    }
  }, []);

  useEffect(() => {
    // all attainments are checked at default -> add them to selected attainments
    if (selectedAttainments.length === 0) {
      setSelectedAttainments(attainments);
    }
  }, [attainments]);

  function handleFormulaChange(event): void {
    const newFormula: FormulaData = formulas.find(
      (formula: FormulaData) => formula.name == event.target.value
    );
    setSelectedFormula(newFormula);
  }

  // checks that user has selected a function and at least one attainment
  // if not, shows error message
  function canBeSubmitted(): boolean {
    let noErrors: boolean = true;
    if (selectedAttainments.length === 0) {
      setCheckboxError('You must select at least one study attainment');
      noErrors = false;
    } else {
      // if an error was previously present, clear it
      setCheckboxError('');
    }

    if (selectedFormula.name === undefined) {
      setFormulaError('You must select a formula');
      noErrors = false;
    } else {
      setFormulaError('');
    }
    return noErrors;
  }

  async function handleSubmit(event): Promise<void> {
    event.preventDefault();
    if (canBeSubmitted()) {
      try {
        const formula: FormulaPreview = await formulasService.getFormulaDetails(selectedFormula.id);
        setSelectedFormula(formula);

        const updatedAttainments: any = selectedAttainments.map((attainment: any) => {
          const attributeObj: object = {};
          formula.attributes.forEach((elem: string) => {
            attributeObj[elem] = '';
          });
          return {
            ...attainment,
            affectCalculation: true,
            formulaAttributes: attributeObj
          };
        });

        // TODO: send formula to database
        // TODO: add updated attainments to database
        console.log(updatedAttainments);

        setSnackPack((prev) => [...prev,
          { msg: 'Formula saved, you will be redirected to the course page.', severity: 'success' }
        ]);
        await sleep(4000);
        navigateToCourseView();
      } catch (exception) {
        console.log(exception);
        setSnackPack((prev) => [...prev,
          { msg: 'Saving the formula failed.', severity: 'error' }
        ]);
      }
    }
  }

  function handleCheckboxChange(event): void {
    const selectedAttainment = attainments.find(attainment => attainment.name == event.target.name);
    if (event.target.checked) {
      setSelectedAttainments(prev => [...prev, selectedAttainment]);
    } else {
      setSelectedAttainments(prev => prev.filter(attainment => attainment !== selectedAttainment));
    }
  }

  function isChecked(attainment): boolean {
    // If user has returned from attribute selection
    // -> only assigments they previously selected are checked
    for (let i: number = 0; i < selectedAttainments.length; i++) {
      if (selectedAttainments[i] === attainment) {
        return true;
      }
    }
    return false;
  }

  function attainmentCheckboxes(): JSX.Element {
    return (
      <>
        {attainments.map((attainment) => (
          <FormControlLabel key={attainment.id} control={
            <Checkbox
              name={attainment.name}
              onChange={handleCheckboxChange}
              checked={isChecked(attainment)}
            />
          } label={attainment.name} />
        ))
        }
      </>
    );
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
        boxShadow: 2,
        borderRadius: 2,
        p: 1,
        my: 3,
        textAlign: 'left'
      }}>
        <FormControl sx={{ m: 3, mb: 0 }} component='fieldset' variant='standard'>
          <FormLabel component='legend' focused={false} sx={{
            color: 'secondary.contrastText', mb: 1.5
          }}>
            Select the sub study attainments you want to include in the calculation
          </FormLabel>
          <FormGroup>
            {attainmentCheckboxes()}
          </FormGroup>
          <FormHelperText error={checkboxError !== ''}>{checkboxError}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 3, mt: 3, minWidth: 280 }} variant='standard'>
          <InputLabel
            id='formulaLabel'
            shrink={true}
            sx={{ fontSize: 'h3.fontSize', mb: -2, position: 'relative' }}
          >
            Formula
          </InputLabel>
          { formulas !== null ?
            <Select
              label='Formula'
              labelId='formulaSelector'
              value={selectedFormula.name ?? ''}
              onChange={handleFormulaChange}
              error={formulaError !== ''}
            >
              { formulas.map((formula: FormulaData) => {
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
          <ViewFormulaAccordion formulaId={selectedFormula.id}/>
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
              size='medium'
              variant='outlined'
              type='submit'
              name='skipAttributes'
              sx={{ mr: 2 }}
            >
              Skip for now
            </Button>
            <Button
              size='medium'
              variant='contained'
              onClick={(): void => canBeSubmitted() && navigateToAttributeSelection()}
            >
              Specify  attributes
            </Button>
          </Box>
        </StyledBox>
        <Button
          sx={{ mt: 0, mb: 1.5, ml: 2.2 }}
          size='medium'
          variant='text'
          onClick={(): void => navigate(-1)}
        >
          Cancel
        </Button>
      </StyledBox>
    </form>
  );

}

SelectFormulaForm.propTypes = {
  attainments: PropTypes.array,
  navigateToCourseView: PropTypes.func,
  navigateToAttributeSelection: PropTypes.func,
};

export default SelectFormulaForm;
