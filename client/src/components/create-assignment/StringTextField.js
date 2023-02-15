// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import subAssignmentServices from '../../services/assignments';

// A TextField component used for the 'name' of an assignment.
// This component could possibly be used for the 'attribute' textfields as well 
// that might be required after specifying a formula.

const StringTextField = ({ fieldData, indices, assignments, setAssignments }) => {

  // Functions for handling the change of the values in the 'New Name' textfield
  const handleChange = (event) => {
    const value = event.target.value;
    const updatedAssignments = JSON.parse(JSON.stringify(assignments));
    if (fieldData.fieldId === 'assignmentName') {
      subAssignmentServices.setProperty(indices, updatedAssignments, 'name', value);
    } else {
      console.log(fieldData.fieldId);
    }
    setAssignments(updatedAssignments);
  };

  const getValue = () => {
    let updatedAssignments = JSON.parse(JSON.stringify(assignments));
    if (fieldData.fieldId === 'assignmentName') {
      return subAssignmentServices.getProperty(indices, updatedAssignments, 'name');
    } else {
      return console.log(fieldData.fieldId);
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
  assignments: PropTypes.array,
  setAssignments: PropTypes.func
};

export default StringTextField;
