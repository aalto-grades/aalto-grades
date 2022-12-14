// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

const inputLabelProps = {
  shrink: true,
  style: {
    fontSize: 32
  }
};
const inputProps = {
  style: {
    margin: '32px 0px 0px 0px'
  }
};
  
const TextFieldBox = ({ fieldData, setFunction }) => {
  const { fieldId, fieldLabel, fieldHelperText } = fieldData;
  return(
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start',  
      flexDirection: 'column', 
      boxShadow: 2, 
      borderRadius: 2,
      my: 2,
      p: 2
    }}>
      <TextField id={fieldId} type={fieldId} label={fieldLabel} variant='standard' color='primary' 
        sx={{ my: 1 }}
        InputLabelProps={inputLabelProps}
        InputProps={inputProps}
        helperText={fieldHelperText}
        onChange={({ target }) => setFunction(target.value)}>
      </TextField>
    </Box>
  );
};

TextFieldBox.propTypes = {
  fieldData: PropTypes.object,
  fieldId: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldHelperText: PropTypes.string,
  setFunction: PropTypes.func,
};

export default TextFieldBox;
