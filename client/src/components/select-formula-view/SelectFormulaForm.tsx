// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';
import {
  NavigateFunction, useOutletContext,
  useNavigate, Params, useParams
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import StyledBox from './StyledBox';
import ViewFormulaAccordion from './ViewFormulaAccordion';
import AlertSnackbar from '../alerts/AlertSnackbar';
import useSnackPackAlerts from '../../hooks/useSnackPackAlerts';
import { sleep } from '../../utils';
import formulaServices from '../../services/formulas';
import { AttainmentData, FormulaData, FormulaPreview } from 'aalto-grades-common/types';
import CircularProgress from '@mui/material/CircularProgress';
import { State } from '../../types';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

function SelectFormulaForm(props: {
  attainments: Array<AttainmentData>,
  navigateToCourseView: () => void,
  navigateToAttributeSelection: () => void
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { courseId }: Params = useParams();

  const [checkboxError, setCheckboxError]: State<string>  = useState('');
  const [formulaError, setFormulaError]: State<string> = useState('');
  const [setSnackPack, messageInfo, setMessageInfo, alertOpen, setAlertOpen] = useSnackPackAlerts();
  const [formulas, setFormulas]: State<Array<FormulaData>> = useState<Array<FormulaData>>([]);
  const [showDialog, setShowDialog]: State<boolean> = useState(false);

  const {
    selectedAttainments, setSelectedAttainments,
    selectedFormula, setSelectedFormula
  } = useOutletContext<any>();

  useEffect(() => {
    if (formulas.length == 0) {
      formulaServices.getFormulas()
        .then((data: Array<FormulaData>) => {
          setFormulas(data);
        })
        .catch((exception: Error) => console.log(exception.message));
    }
  }, []);

  useEffect(() => {
    // all attainments are checked at default -> add them to selected attainments
    if (selectedAttainments.length === 0) {
      setSelectedAttainments(props.attainments);
    }
  }, [props.attainments]);

  function handleFormulaChange(event: SelectChangeEvent): void {
    const newFormula: FormulaData | undefined = formulas.find(
      (formula: FormulaData) => formula.name == event.target.value
    );

    if (newFormula)
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

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    if (canBeSubmitted()) {
      try {
        const formula: FormulaPreview =
          await formulaServices.getFormulaDetails(selectedFormula.id);
        setSelectedFormula(formula);

        const updatedAttainments: any = selectedAttainments.map((attainment: AttainmentData) => {
          const attributeObj: object = {};
          formula.attributes.forEach((elem: string) => {
            (attributeObj as any)[elem] = '';
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
        props.navigateToCourseView();
      } catch (exception) {
        console.log(exception);
        setSnackPack((prev) => [...prev,
          { msg: 'Saving the formula failed.', severity: 'error' }
        ]);
      }
    }
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedAttainment: AttainmentData | undefined = props.attainments.find(
      (attainment: AttainmentData) => attainment.name == event.target.name
    );

    if (!selectedAttainment)
      return;

    if (event.target.checked) {
      setSelectedAttainments((prev: Array<AttainmentData>) => [...prev, selectedAttainment]);
    } else {
      setSelectedAttainments((prev: Array<AttainmentData>) => prev.filter(
        (attainment: AttainmentData) => attainment.id !== selectedAttainment.id)
      );
    }
  }

  function isChecked(attainment: AttainmentData): boolean {
    // If user has returned from attribute selection
    // -> only assigments they previously selected are checked
    for (let i: number = 0; i < selectedAttainments.length; i++) {
      if (selectedAttainments[i].id === attainment.id) {
        return true;
      }
    }
    return false;
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
                value={selectedFormula.name ?? ''}
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
          <ViewFormulaAccordion formulaId={selectedFormula.id} />
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
                if (selectedFormula?.id || selectedAttainments.length != props.attainments.length) {
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
        navigateDir={'/course-view/' + courseId}
      />
    </form>
  );
}

SelectFormulaForm.propTypes = {
  attainments: PropTypes.array,
  navigateToCourseView: PropTypes.func,
  navigateToAttributeSelection: PropTypes.func,
};

export default SelectFormulaForm;
