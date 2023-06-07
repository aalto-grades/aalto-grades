// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import attainmentServices from '../../services/attainments';

// A TextField component used for the 'date' of an attainment and the 'expiryDate'

const DateTextField = ({ fieldData, indices, attainments, setAttainments }) => {

  // Functions for handling the change of the values in the date textfields
  const handleChange = (event) => {
    const value = event.target.value;
    if (fieldData.fieldId === 'attainmentDate') {
      const updatedAttainments = attainmentServices.setProperty(indices, attainments, 'date', value);
      setAttainments(updatedAttainments);
    } else if (fieldData.fieldId === 'expiryDate') {
      const updatedAttainments = attainmentServices.setProperty(indices, attainments, 'expiryDate', value);
      setAttainments(updatedAttainments);
    } else {
      console.log(fieldData.fieldId);
    }
  };

  const getValue = () => {
    if (fieldData.fieldId === 'attainmentDate') {
      return attainmentServices.getProperty(indices, attainments, 'date');
    } else if (fieldData.fieldId === 'expiryDate') {
      return attainmentServices.getProperty(indices, attainments, 'expiryDate');
    } else {
      console.log(fieldData.fieldId);
    }
  };

  return (
    <TextField
      type='date'
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      variant='standard'
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={getValue()}
      sx={{
        marginTop: 0
      }}
      onChange={(event) => handleChange(event)}
    />
  );
};

DateTextField.propTypes = {
  fieldData: PropTypes.object,
  fieldId: PropTypes.string,
  fieldLabel: PropTypes.string,
  indices: PropTypes.array,
  attainments: PropTypes.array,
  setAttainments: PropTypes.func
};

export default DateTextField;
