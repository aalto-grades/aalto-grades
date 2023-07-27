// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FormulaData } from 'aalto-grades-common/types';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Container, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { StyledComponent } from '@emotion/styled';
import PropTypes from 'prop-types';
import { JSX } from 'react';

import StyledBox from './StyledBox';

import { getParamLabel } from '../../utils';

const HoverExpandMoreIcon: StyledComponent<object> = styled(ExpandMore)(
  ({ theme }: { theme: Theme }) => ({
    '&:hover': {
      background: theme.palette.hoverGrey1
    }
  })
);

export default function FormulaSummary(props: {
  formula: FormulaData,
  params: object,
  childParams: Map<string, object>,
  constructParamsObject: () => object | undefined
}): JSX.Element {

  return (
    <Box sx={{ p: 1 }}>
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography sx={{ fontWeight: 'bold' }}>
                  Formula
                </Typography>
              </TableCell>
              {
                props.formula.params.map((param: string) => (
                  <TableCell key={param}>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {getParamLabel(param)}
                    </Typography>
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{props.formula.name}</TableCell>
              {
                props.formula.params.map((param: string) => (
                  <TableCell key={param}>
                    {props.params[param as keyof object]}
                  </TableCell>
                ))
              }
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography sx={{ fontWeight: 'bold' }}>
                  Attainment
                </Typography>
              </TableCell>
              {
                props.formula.childParams.map((param: string) => (
                  <TableCell key={param}>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {getParamLabel(param)}
                    </Typography>
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              Array.from(props.childParams.entries()).map(
                (childParam: [string, object]) => (
                  <TableRow key={childParam[0]}>
                    <TableCell>
                      {childParam[0]}
                    </TableCell>
                    {
                      props.formula.childParams.map((param: string) => (
                        <TableCell key={param}>
                          {childParam[1][param as keyof object]}
                        </TableCell>
                      ))
                    }
                  </TableRow>
                )
              )
            }
          </TableBody>
        </Table>
      </TableContainer>
      <StyledBox>
        <Container>
          <Accordion sx={{ boxShadow: 'none' }}>
            <AccordionSummary
              expandIcon={<HoverExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              sx={{ pl: 0 }}
            >
              <Typography>Formula parameters in JSON</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'primary.light', p: '10px' }}>
              <Container disableGutters sx={{ overflowX: 'scroll' }}>
                <pre>
                  <code>
                    {JSON.stringify(props.constructParamsObject(), null, 2)}
                  </code>
                </pre>
              </Container>
            </AccordionDetails>
          </Accordion>
        </Container>
      </StyledBox>
    </Box>
  );
}

FormulaSummary.propTypes = {
  formula: PropTypes.object,
  params: PropTypes.object,
  childParams: PropTypes.object,
  constructParamsObject: PropTypes.func
};
