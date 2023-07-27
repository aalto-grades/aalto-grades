// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { ChangeEvent } from 'react';

import { TextFieldData } from '../../types';

export default function StringTextField(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  attainment: AttainmentData,
  value: string,
  fieldData: TextFieldData
}): JSX.Element {

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const key: keyof AttainmentData = props.fieldData.fieldId as keyof AttainmentData;
    (props.attainment[key] as unknown) = event.target.value;
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
        marginTop: 0,
        width: '100%'
      }}
      onChange={handleChange}
    />
  );
}

StringTextField.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  attainment: PropTypes.object,
  value: PropTypes.string,
  fieldData: PropTypes.object
};
