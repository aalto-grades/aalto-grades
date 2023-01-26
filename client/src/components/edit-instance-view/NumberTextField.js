// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

const NumberTextField = ({ fieldData, value, setFunction }) => {
  return (
    <TextField
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      type={fieldData.fieldId}
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={value}
      onChange={({ target }) => setFunction(target.value)}
    />
  );
};
  
NumberTextField.propTypes = {
  fieldData: PropTypes.object,
  value: PropTypes.number,
  setFunction: PropTypes.func,
};
  
export default NumberTextField;
