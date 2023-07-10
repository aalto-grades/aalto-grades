// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { AttainmentData } from 'aalto-grades-common/types';
import { TextFieldData } from '../../types';

function StringTextField(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  attainment: AttainmentData,
  value: string,
  fieldData: TextFieldData
}): JSX.Element {

  // Functions for handling the change of the values in the 'New Name' textfield
  // and the textfields that represent formula attributes
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    (props.attainment as any)[props.fieldData.fieldId] = event.target.value;
    props.setAttainmentTree(structuredClone(props.attainmentTree));
  }

  return (
    <TextField
      type='text'
      key={props.fieldData.fieldId}
      id={props.fieldData.fieldId}
      variant='standard'
      label={props.fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={props.value}
      sx={{
        marginTop: 0,
        width: '100%'
      }}
      onChange={(event: ChangeEvent<HTMLInputElement>): void => handleChange(event)}
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

export default StringTextField;
