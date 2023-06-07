// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

const NumberTextField = ({ fieldData, value, setFunction }) => {

  const error = !(value.length !== 0 && !isNaN(value) && (Number.isInteger(Number(value))) && (Number(value) >= 0));

  return (
    <TextField
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]+' }}
      margin='normal'
      value={value}
      error={error}
      helperText={error ? 'Value needs to be an integer' : ''}
      onChange={({ target }) => setFunction(target.value)}
    />
  );
};

NumberTextField.propTypes = {
  fieldData: PropTypes.object,
  value: PropTypes.string,
  setFunction: PropTypes.func,
};

export default NumberTextField;
