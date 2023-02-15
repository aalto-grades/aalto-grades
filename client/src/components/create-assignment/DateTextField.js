// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import subAssignmentServices from '../../services/subAssignments';

const DateTextField = ({ fieldData, indices, assignments, setAssignments }) => {

  const handleChange = (event) => {
    const value = event.target.value;
    const updatedAssignments = JSON.parse(JSON.stringify(assignments));
    switch (fieldData.fieldId) {
    case 'assignmentDate':
      subAssignmentServices.setProperty(indices, updatedAssignments, 'date', value);
      break;
    case 'expiryDate':
      subAssignmentServices.setProperty(indices, updatedAssignments, 'expiryDate', value);
      break;
    default:
      console.log(fieldData.fieldId);
    }
    setAssignments(updatedAssignments);
  };

  const getValue = () => {
    let updatedAssignments = JSON.parse(JSON.stringify(assignments));
    let subAssignments = [];
    const lastIndex = indices[indices.length - 1];
    for (let i = 0; i < indices.length - 1; i++) {
      const index = indices[i];
      subAssignments = updatedAssignments[index].subAssignments;
      updatedAssignments = subAssignments;
    }
    switch (fieldData.fieldId) {
    case 'assignmentDate':
      return updatedAssignments[lastIndex]['date'];
    case 'expiryDate':
      return updatedAssignments[lastIndex]['expiryDate'];
    default:
      return console.log(fieldData.fieldId);
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
