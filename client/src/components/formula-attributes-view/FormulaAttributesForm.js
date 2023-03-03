// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import StyledBox from '../select-formula-view/StyledBox';
import Assignment from './Assignment';

const FormulaAttributesForm = ({ assignments, navigateToCourseView, formula }) => {

  const [attributeValues, setAttributeValues] = useState([]);

  useEffect(() => {
    setAttributeValues(Array(assignments.length).fill(Array(formula.attributes.length).fill('')));
  }, [assignments, formula]);

  const handleAttributeChange = (assignmentIndex, attributeIndex, event) => {
    const newAttributeValues = attributeValues.map((a, index) => {
      if (assignmentIndex == index) {
        const newAttributes = a.map((attribute, i) => {
          return (attributeIndex == i) ? event.target.value : attribute;
        });
        return newAttributes;
      } else {
        return a;
      }
    });
    setAttributeValues(newAttributeValues);
  };

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
        bgcolor: 'primary.light',
        borderRadius: 1,
        pt: 2
      }}>
        { assignments.map((assignment, assignmentIndex) =>
          <Assignment
            assignment={assignment}
            key={assignment.id}
            assignmentIndex={assignmentIndex}
            attributes={formula.attributes}
            handleAttributeChange={handleAttributeChange}
          />) }
      </StyledBox>
      <StyledBox sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ alignSelf: 'flex-end', m: '20px' }}>
          <Button size='medium' variant='outlined' type='submit' name='goBack' sx={{ mr: 2 }}>
            Go back
          </Button>
          <Button size='medium' variant='contained' type='submit' name='confirm'>
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
  formula: PropTypes.object,
};

export default FormulaAttributesForm;