// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

const DateTextField = ({ fieldData, value, setFunction, minWidth }) => {
  return (
    <TextField
      sx={{ minWidth: minWidth }}
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      type='date'
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={value}
      onChange={({ target }) => setFunction(target.value)}
      required
    />
  );
};
  
DateTextField.propTypes = {
  fieldData: PropTypes.object,
  value: PropTypes.string,
  setFunction: PropTypes.func,
  minWidth: PropTypes.number,
};

export default DateTextField;
