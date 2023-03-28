// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import assignmentServices from '../../services/assignments';

// A TextField component used for the 'name' of an attainment.
// This component is also used for the formula attribute textfields that are required after specifying a formula.

const StringTextField = ({ fieldData, indices, attainments, setAttainments }) => {

  // Functions for handling the change of the values in the 'New Name' textfield 
  // and the textfields that represent formula attributes
  const handleChange = (event) => {
    const value = event.target.value;
    if (fieldData.fieldId === 'attainmentName') {
      const updatedAttainments = assignmentServices.setProperty(indices, attainments, 'name', value);
      setAttainments(updatedAttainments);
    } else if (fieldData.fieldId.startsWith('attribute')) {
      const attributeIndex = Number(fieldData.fieldId.slice(-1));
      const updatedAttainments = assignmentServices.setFormulaAttribute(indices, attainments, attributeIndex, value);
      setAttainments(updatedAttainments);
    } else {
      console.log(fieldData.fieldId);
    }
  };

  const getValue = () => {
    if (fieldData.fieldId === 'attainmentName') {
      return assignmentServices.getProperty(indices, attainments, 'name');
    } else if (fieldData.fieldId.startsWith('attribute')) {
      const attributeIndex = Number(fieldData.fieldId.slice(-1));
      return assignmentServices.getFormulaAttribute(indices, attainments, attributeIndex);
    } else {
      console.log(fieldData.fieldId);
    }
  };

  return (
    <TextField
      type='text'
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      variant='standard' 
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={getValue()}
      sx={{
        marginTop: 0,
        width: '100%'
      }}
      onChange={(event) => handleChange(event)}
    />
  );
};
  
StringTextField.propTypes = {
  fieldData: PropTypes.object,
  fieldId: PropTypes.string,
  fieldLabel: PropTypes.string,
  indices: PropTypes.array,
  attainments: PropTypes.array,
  setAttainments: PropTypes.func
};

export default StringTextField;
