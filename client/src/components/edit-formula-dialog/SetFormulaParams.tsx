// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { ChangeEvent } from 'react';

import SubAttainment from './SubAttainment';
import StyledBox from '../edit-formula-dialog/StyledBox';

import { getParamLabel } from '../../utils';

export default function SetFormulaParams(props: {
  attainment: AttainmentData,
  formula: FormulaData,
  params: object,
  setParams: (formulaParams: object) => void,
  childParams: Map<string, object>,
  setChildParams: (childParams: Map<string, object>) => void
}): JSX.Element {

  function handleParamChange(
    event: ChangeEvent<HTMLInputElement>, param: string
  ): void {
    // TODO: This will not always be a number
    (props.params[param as keyof object] as unknown) = Number(event.target.value);
  }

  return (
    <>
      {
        props.formula.params.map((param: string) => {
          return (
            <TextField
              type='text'
              key={param}
              label={getParamLabel(param)}
              InputLabelProps={{ shrink: true }}
              margin='normal'
              sx={{
                marginTop: 0,
                width: '100%',
                my: 1
              }}
              onChange={
                (event: ChangeEvent<HTMLInputElement>): void => {
                  handleParamChange(event, param);
                }
              }
            />
          );
        })
      }
      <StyledBox sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        bgcolor: 'primary.light',
        borderRadius: 1,
        pt: 2
      }}>
        {
          props.attainment.subAttainments?.map(
            (attainment: AttainmentData) => {
              return (
                <SubAttainment
                  key={attainment.tag}
                  attainment={attainment}
                  childParamsList={props.formula.childParams}
                  childParams={props.childParams}
                  setChildParams={props.setChildParams}
                />
              );
            }
          )
        }
      </StyledBox>
    </>
  );
}

SetFormulaParams.propTypes = {
  attainment: PropTypes.object,
  formula: PropTypes.object,
  params: PropTypes.object,
  setParams: PropTypes.func,
  childParams: PropTypes.any,
  setChildParams: PropTypes.func
};
