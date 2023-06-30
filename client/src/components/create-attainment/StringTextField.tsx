// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import attainmentServices from '../../services/attainments';

// A TextField component used for the 'name' of an attainment.
// This component is also used for the formula attribute textfields that are
// required after specifying a formula.

function StringTextField({ fieldData, indices, value, attainmentTree, setAttainmentTree }) {

  // Functions for handling the change of the values in the 'New Name' textfield
  // and the textfields that represent formula attributes
  function handleChange(event) {
    /*const value = event.target.value;
    if (fieldData.fieldId === 'attainmentName') {
      const updatedAttainments = attainmentServices.setProperty(
        indices, attainments, 'name', value
      );

      setAttainments(updatedAttainments);
    } else if (fieldData.fieldId.startsWith('attribute')) {
      const attributeKey = fieldData.fieldId.split('_')[1];
      const updatedAttainments = attainmentServices.setFormulaAttribute(
        indices, attainments, attributeKey, value
      );

      setAttainments(updatedAttainments);
    } else {
      console.log(fieldData.fieldId);
    }*/
  }

  function getValue() {
    /*if (fieldData.fieldId === 'attainmentName') {
      return attainmentServices.getProperty(indices, attainments, 'name');
    } else if (fieldData.fieldId.startsWith('attribute')) {
      const attributeKey = fieldData.fieldId.split('_')[1];
      return attainmentServices.getFormulaAttribute(indices, attainments, attributeKey);
    } else {
      console.log(fieldData.fieldId);
    }*/
  }

  return (
    <TextField
      type='text'
      key={fieldData.fieldId}
      id={fieldData.fieldId}
      variant='standard'
      label={fieldData.fieldLabel}
      InputLabelProps={{ shrink: true }}
      margin='normal'
      value={value}
      sx={{
        marginTop: 0,
        width: '100%'
      }}
      onChange={(event) => handleChange(event)}
    />
  );
}

StringTextField.propTypes = {
  fieldData: PropTypes.object,
  indices: PropTypes.array,
  value: PropTypes.string,
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func
};

export default StringTextField;
