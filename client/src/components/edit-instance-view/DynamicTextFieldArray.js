// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const DynamicTextFieldArray = ({ fieldData, values, setFunction }) => {

  const addFields = () => {
    setFunction([...values, '']);
  }; 
  
  const removeFields = (index) => {
    const fields = [...values];
    fields.splice(index, 1);
    setFunction(fields);
  };
  
  const handleChange = (index, event)=>{
    const value = event.target.value;
    const fields = [...values];
    fields[index] = value;
    setFunction(fields);
  };
  
  return(
    <Box sx={{ display: 'flex',  alignItems: 'flex-start', flexDirection: 'column' }}>
      {values.map((item, index) => (
        index === values.length - 1 ?
          <Box key={index} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <TextField
              id={fieldData.fieldId}
              type={fieldData.fieldId}
              label={fieldData.fieldLabel}
              InputLabelProps={{ shrink: true }}
              margin='normal'
              value={item}
              onChange={(evnt) => handleChange(index, evnt)}
            />
            <IconButton size='small' onClick={addFields}>
              <AddIcon/>
            </IconButton>
          </Box>
          :
          <Box key={index} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <TextField
              id={fieldData.fieldId}
              type={fieldData.fieldId}
              label={fieldData.fieldLabel}
              InputLabelProps={{ shrink: true }}
              margin='normal'
              value={item}
              onChange={(event) => handleChange(index, event)}
            />
            <IconButton size='small' onClick={() => removeFields(index)}>
              <RemoveIcon/>
            </IconButton>
          </Box>
      ))}
    </Box>
  );
};
  
DynamicTextFieldArray.propTypes = {
  values: PropTypes.array,
  fieldData: PropTypes.object,
  setFunction: PropTypes.func,
};

export default DynamicTextFieldArray;
