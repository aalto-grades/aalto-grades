// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import StyledBox from '../select-formula-view/StyledBox';
import Assignment from './Assignment';

const FormulaAttributesForm = ({ assignments, navigateToCourseView }) => {


  const handleSubmit = (event) => {
    event.preventDefault();
    if (event.nativeEvent.submitter.name == 'confirm') {
      // TODO: send to 
      // TODO: add notification "confimer, you will be redirected to course view"
      navigateToCourseView();
    } else {
      // TODO: redirect back to previous page
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <StyledBox sx={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        bgcolor: 'primary.light'
      }}>
        { assignments.map((assignment) => <Assignment assignment={assignment} key={assignment.id} />) }
      </StyledBox>
      <StyledBox sx={{ display: 'flex', flexDirection: 'column', }}>
        <Box sx={{ m: 3, mr: 1, alignSelf: 'flex-end' }}>
          <Button size='small' variant='outlined' type='submit' name='goBack' sx={{ mr: 2 }}>
            Go back
          </Button>
          <Button size='small' variant='contained' type='submit' name='confirm'>
            Confirm
          </Button>
        </Box>
      </StyledBox>
      
    </form>
  );
};

FormulaAttributesForm.propTypes = {
  assignments: PropTypes.array,
  navigateToCourseView: PropTypes.func,
};

export default FormulaAttributesForm;