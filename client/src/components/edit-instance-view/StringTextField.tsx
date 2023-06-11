// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

const StringTextField = ({ fieldData, value, setFunction }) => {
  return (
    <TextField
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      type='text'
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={value}
      onChange={({ target }) => setFunction(target.value)}
    />
  );
};

StringTextField.propTypes = {
  fieldData: PropTypes.object,
  value: PropTypes.string,
  setFunction: PropTypes.func,
};

export default StringTextField;
