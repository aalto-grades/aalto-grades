// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData, ChildParamsObject, FormulaData, ParamsObject
} from 'aalto-grades-common/types';
import { TextField } from '@mui/material';
import { ChangeEvent, JSX } from 'react';

import SubAttainment from './SubAttainment';
import StyledBox from '../edit-formula-dialog/StyledBox';

import { getParamLabel } from '../../utils';

export default function SetFormulaParams(props: {
  attainment: AttainmentData,
  formula: FormulaData,
  params: ParamsObject | null,
  setParams: (formulaParams: ParamsObject) => void,
  childParams: Map<string, ChildParamsObject> | null,
  setChildParams: (childParams: Map<string, object>) => void
}): JSX.Element {

  if (!props.params && !props.childParams) {
    if (props.attainment.formula === props.formula.id && props.attainment.formulaParams) {
      const oldParams: ParamsObject =
        structuredClone(props.attainment.formulaParams) as ParamsObject;

      props.setParams({
        ...oldParams,
        children: undefined
      });
      props.setChildParams(new Map(oldParams.children));
    } else {
      props.setParams({ minRequiredGrade: 0 });
      props.setChildParams(new Map());
    }
  }

  function handleParamChange(
    event: ChangeEvent<HTMLInputElement>, param: string
  ): void {
    // TODO: This will not always be a number
    if (props.params)
      props.params[param] = Number(event.target.value);
  }

  return (
    <>
      {
        props.formula.params.map((param: string) => {
          if (props.params) {
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
                defaultValue={props.params[param]}
              />
            );
          }
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
              if (props.childParams) {
                return (
                  <SubAttainment
                    key={attainment.id}
                    attainment={attainment}
                    childParamsList={props.formula.childParams}
                    childParams={props.childParams}
                    setChildParams={props.setChildParams}
                  />
                );
              }
            }
          )
        }
      </StyledBox>
    </>
  );
}
