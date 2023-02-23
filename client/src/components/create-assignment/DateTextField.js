// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import assignmentServices from '../../services/assignments';

// A TextField component used for the 'date' of an assignment and the 'expiryDate'

const DateTextField = ({ fieldData, indices, assignments, setAssignments }) => {

  // Functions for handling the change of the values in the date textfields
  const handleChange = (event) => {
    const value = event.target.value;
    if (fieldData.fieldId === 'assignmentDate') {
      const updatedAssignments = assignmentServices.setProperty(indices, assignments, 'date', value);
      setAssignments(updatedAssignments);
    } else if (fieldData.fieldId === 'expiryDate') {
      const updatedAssignments = assignmentServices.setProperty(indices, assignments, 'expiryDate', value);
      setAssignments(updatedAssignments);
    } else {
      console.log(fieldData.fieldId);
    }
  };

  const getValue = () => {
    if (fieldData.fieldId === 'assignmentDate') {
      return assignmentServices.getProperty(indices, assignments, 'date');
    } else if (fieldData.fieldId === 'expiryDate') {
      return assignmentServices.getProperty(indices, assignments, 'expiryDate');
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
  assignments: PropTypes.array,
  setAssignments: PropTypes.func
};

export default DateTextField;
