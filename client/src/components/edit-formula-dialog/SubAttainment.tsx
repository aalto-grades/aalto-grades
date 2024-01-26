// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, InputField, ListParam, Param} from '@common/types';
import {Box, TextField, Typography, MenuItem} from '@mui/material';
import {ChangeEvent, JSX} from 'react';

import {getParamLabel} from '../../utils';

export default function SubAttainment(props: {
  attainment: AttainmentData;
  childParamsList: Array<Param>;
  childParams: Map<string, object>;
  setChildParams: (childParams: Map<string, object>) => void;
}): JSX.Element {
  const params: object = props.childParams.get(props.attainment.name) ?? {};

  function handleParamChange(
    event: ChangeEvent<HTMLInputElement>,
    param: string
  ): void {
    // TODO: This will not always be a number
    // for the childparam, we want to also identify its input type eg. textfield or radio
    (params[param as keyof object] as unknown) = isNaN(
      Number(event.target.value)
    )
      ? event.target.value
      : Number(event.target.value);
    props.childParams.set(props.attainment.name, params);
    props.setChildParams(new Map(props.childParams));
  }

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 2,
        borderRadius: 2,
        px: 3,
        pt: 1,
        pb: 1.5,
        width: 1,
        mx: 1.5,
        mb: 2,
      }}
    >
      <Typography align="left" style={{fontWeight: 'bold'}} sx={{my: 1}}>
        {props.attainment.name}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gridTemplateRows: 'auto',
          columnGap: 3,
          rowGap: 1,
          mt: 2,
        }}
      >
        {props.childParamsList.map((param: Param) => {
          if (
            param.requires &&
            params[param.requires.param as keyof object] !== param.requires.toBe
          )
            return null;
          if (param.inputField === InputField.Text) {
            return (
              <TextField
                type="text"
                key={param.name}
                label={getParamLabel(param.name)}
                InputLabelProps={{shrink: true}}
                margin="normal"
                sx={{
                  marginTop: 0,
                  width: '100%',
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  handleParamChange(event, param.name);
                }}
                defaultValue={params[param.name as keyof object]}
              />
            );
          } else if (param.inputField === InputField.List) {
            const listParam: ListParam = param as ListParam;
            return (
              <TextField
                key={listParam.name}
                select
                label={getParamLabel(listParam.name)}
                sx={{
                  marginTop: 0,
                  width: '100%',
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  handleParamChange(event, listParam.name);
                }}
                defaultValue={params[listParam.name as keyof object]}
              >
                {listParam.options.map((optionName: string) => {
                  return (
                    <MenuItem
                      key={optionName}
                      value={listParam.optionsMap[optionName]}
                    >
                      {optionName}
                    </MenuItem>
                  );
                })}
              </TextField>
            );
          }
        })}
      </Box>
    </Box>
  );
}
