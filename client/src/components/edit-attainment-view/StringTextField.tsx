// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import TextField from '@mui/material/TextField';
import { ChangeEvent } from 'react';

export interface AttainmentTextFieldData {
  fieldId: keyof AttainmentData,
  fieldLabel: string
}

export default function StringTextField(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  attainment: AttainmentData,
  value: string,
  fieldData: AttainmentTextFieldData,
  setTouched: () => void
}): JSX.Element {

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    props.setTouched();
    (props.attainment[props.fieldData.fieldId] as unknown) = event.target.value;
    props.setAttainmentTree(structuredClone(props.attainmentTree));
  }

  return (
    <TextField
      type='text'
      key={props.fieldData.fieldId}
      id={props.fieldData.fieldId}
      label={props.fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={props.value}
      sx={{
        mt: 0,
        width: '100%'
      }}
      onChange={handleChange}
    />
  );
}
