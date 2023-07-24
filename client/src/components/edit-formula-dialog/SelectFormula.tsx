// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FormulaData } from 'aalto-grades-common/types';
import {
  CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import AlertSnackbar from '../alerts/AlertSnackbar';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import ViewFormulaAccordion from './ViewFormulaAccordion';

import { useGetAllFormulas } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import StyledBox from './StyledBox';
import { State } from '../../types';

export default function SelectFormula(props: {
  formula: FormulaData | null,
  setFormula: (formula: FormulaData) => void,
  error: string
}): JSX.Element {

  const [showDialog, setShowDialog]: State<boolean> = useState(false);
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  const formulas: UseQueryResult<Array<FormulaData>> = useGetAllFormulas();

  function handleFormulaChange(event: SelectChangeEvent): void {
    const newFormula: FormulaData | undefined = formulas.data?.find(
      (formula: FormulaData) => formula.name == event.target.value
    );

    if (newFormula)
      props.setFormula(newFormula);
  }

  return (
    <>
      <AlertSnackbar snackPack={snackPack} />
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
            formulas.data?.length !== 0 ?
              <Select
                label='Formula'
                labelId='formulaSelector'
                value={props.formula?.name ?? ''}
                onChange={handleFormulaChange}
                error={props.error !== ''}
              >
                {
                  formulas.data?.map((formula: FormulaData) => {
                    return (
                      <MenuItem key={formula.id} value={formula.name}>
                        {formula.name}
                      </MenuItem>
                    );
                  })
                }
              </Select>
              :
              <CircularProgress sx={{ mt: 2 }} />
          }
          <FormHelperText error={props.error !== ''}>{props.error}</FormHelperText>
        </FormControl>
        <StyledBox>
          <ViewFormulaAccordion formulaId={props.formula?.id ?? null} />
        </StyledBox>
      </StyledBox>
      <UnsavedChangesDialog
        setOpen={setShowDialog}
        open={showDialog}
        navigateDir={'/course-view/'}
      />
    </>
  );
}

SelectFormula.propTypes = {
  formula: PropTypes.object,
  formulaData: PropTypes.func,
  error: PropTypes.string
};
