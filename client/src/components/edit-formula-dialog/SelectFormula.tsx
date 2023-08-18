// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { StyledComponent } from '@emotion/styled';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress,
  Container, FormControl, FormHelperText, InputLabel, MenuItem, Select,
  SelectChangeEvent, Typography
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { JSX } from 'react';
import { UseQueryResult } from '@tanstack/react-query';

import AlertSnackbar from '../alerts/AlertSnackbar';
import StyledBox from './StyledBox';

import { useGetAllFormulas } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';

const HoverExpandMoreIcon: StyledComponent<object> = styled(ExpandMore)(
  ({ theme }: { theme: Theme }) => ({
    '&:hover': {
      background: theme.palette.hoverGrey1
    }
  })
);

export default function SelectFormula(props: {
  attainment: AttainmentData,
  formula: FormulaData | null,
  setFormula: (formula: FormulaData) => void,
  clearParams: () => void,
  error: string
}): JSX.Element {

  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  const formulas: UseQueryResult<Array<FormulaData>> = useGetAllFormulas();

  if (!props.formula && props.attainment.formula) {
    const currentFormula: FormulaData | undefined = formulas.data?.find(
      (formula: FormulaData) => formula.id == props.attainment.formula
    );

    if (currentFormula) {
      props.setFormula(currentFormula);
    }
  }

  function handleFormulaChange(event: SelectChangeEvent): void {
    const newFormula: FormulaData | undefined = formulas.data?.find(
      (formula: FormulaData) => formula.name == event.target.value
    );

    if (newFormula) {
      props.setFormula(newFormula);
    }

    props.clearParams();
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
            (formulas.data?.length !== 0) ? (
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
            ) : (
              <CircularProgress sx={{ mt: 2 }} />
            )
          }
          <FormHelperText error={props.error !== ''}>{props.error}</FormHelperText>
        </FormControl>
        <StyledBox>
          <Container>
            <Accordion sx={{ boxShadow: 'none' }}>
              <AccordionSummary
                expandIcon={<HoverExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{ pl: 0 }}
              >
                <Typography>Preview of the formula</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'primary.light', p: '10px' }}>
                <Container disableGutters sx={{ overflowX: 'scroll' }}>
                  {
                    (!props.formula) ? (
                      <p>Select formula for previewing</p>
                    ) : (
                      (!props.formula) ? (
                        <Box
                          sx={{
                            margin: 'auto',
                            alignItems: 'center',
                            justifyContent: 'center',
                            display: 'flex'
                          }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <pre>
                          <code>{props.formula.codeSnippet}</code>
                        </pre>
                      )
                    )
                  }
                </Container>
              </AccordionDetails>
            </Accordion>
          </Container>
        </StyledBox>
      </StyledBox>
    </>
  );
}
