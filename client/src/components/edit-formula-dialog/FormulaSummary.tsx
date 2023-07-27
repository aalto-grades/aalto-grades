// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FormulaData } from 'aalto-grades-common/types';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { JSX } from 'react';

import { getParamLabel } from '../../utils';

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
                props.formula.params.map((param: string) => {
                  return (
                    <TableCell key={param}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {getParamLabel(param)}
                      </Typography>
                    </TableCell>
                  );
                })
              }
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{props.formula.name}</TableCell>
              {
                props.formula.params.map((param: string) => {
                  return (
                    <TableCell key={param}>
                      {props.params[param as keyof object]}
                    </TableCell>
                  );
                })
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
                props.formula.childParams.map((param: string) => {
                  console.log(param);
                  return (
                    <TableCell key={param}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {getParamLabel(param)}
                      </Typography>
                    </TableCell>
                  );
                })
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              Array.from(props.childParams.entries()).map(
                (childParam: [string, object]) => {
                  return (
                    <TableRow key={childParam[0]}>
                      <TableCell>
                        {childParam[0]}
                      </TableCell>
                      {
                        props.formula.childParams.map((param: string) => {
                          return (
                            <TableCell key={param}>
                              {childParam[1][param as keyof object]}
                            </TableCell>
                          );
                        })
                      }
                    </TableRow>
                  );
                }
              )
            }
          </TableBody>
        </Table>
      </TableContainer>
      <code>
        {JSON.stringify(props.constructParamsObject())}
      </code>
    </Box>
  );
}

FormulaSummary.propTypes = {
  formula: PropTypes.object,
  params: PropTypes.object,
  childParams: PropTypes.object,
  constructParamsObject: PropTypes.func
};
