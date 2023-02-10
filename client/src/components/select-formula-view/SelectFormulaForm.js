// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React/*, { useState }*/ from 'react';
//import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';



const SelectFormulaForm = () => {

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(event.submitter.name());
    try {
      const formulaObject = ({

      });
      console.log(formulaObject);
      // TODO: send formula to backend?
    } catch (exception) {
      console.log(exception);
    }
  };

  return(
    <form onSubmit={handleSubmit}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        flexDirection: 'column', 
        justifyContent: 'space-around',
        boxShadow: 2, 
        borderRadius: 2,
        my: 2,
        p: 2
      }}>
        <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
          <FormLabel component="legend">Check the sub-assignments you want to include</FormLabel>
          <FormGroup>
            <FormControlLabel control={
              <Checkbox name="1" />
            } label="assignment 1" />
          </FormGroup>
        </FormControl>
        <Button size='small' variant='outlined' type='submit' name='skipAttributes'>
        Skip for now
        </Button>
        <Button size='small' variant='contained' type='submit' name='specifyAttributes'>
        Specify  attributes
        </Button>
      </Box>
    </form>
  );

};

export default SelectFormulaForm;