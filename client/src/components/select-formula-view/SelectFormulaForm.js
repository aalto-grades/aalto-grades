// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import ViewFormulaAccordion from './ViewFormulaAccordion';

const StyledBox = styled(Box)`
  width: 53vw;
  minWidth:  400px;
  maxWidth: 1000px;
`;

const SelectFormulaForm = ({ assignments, formulas, instaceId }) => {

  const [formula, setFormula] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const navigate = useNavigate();

  const handleFormulaChange = (event) => {
    const newFormula = formulas.find(formula => formula.name == event.target.value);
    setCodeSnippet(newFormula.codeSnippet);
    setFormula(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(event.nativeEvent.submitter.name);
    try {
      // TODO: send formula to backend -> needs instance id?
      const formulaObject = ({
        formula,
        selectedAssignments
      });
      console.log(formulaObject);

      if (event.nativeEvent.submitter.name == 'skipAttributes') {
        // should this be course id instead? 
        navigate(`/course-view/${instaceId}`, { replace: true });
      } else {
        // TODO: redirect to specify attribures
      }
      
    } catch (exception) {
      console.log(exception);
    }
  };

  const assignmentCheckboxes = () => {
    return (
      <>
        { assignments.map((assignment) => (
          <FormControlLabel key={assignment.name} control={
            <Checkbox name={assignment.name} onChange={(event) => {
              if(event.target.checked) {
                setSelectedAssignments(prev => [...prev, event.target.name]);
              } else {
                setSelectedAssignments(prev => prev.filter(fruit => fruit !== event.target.name));
              }
            }}/>
          } label={assignment.name} />
        ))
        }
      </>
    );
  };

  return(
    <form onSubmit={handleSubmit}>
      <StyledBox sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        flexDirection: 'column', 
        boxShadow: 2, 
        borderRadius: 2,
        p: 1,
        my: 3,
        textAlign: 'left'
      }}>
        <FormControl sx={{ m: 3,  mb: 0 }} component='fieldset' variant='standard'>
          <FormLabel component='legend' focused={false} sx={{ color: '#000', mb:1.5 }}>Select the sub-assignments you want to include in the calculation</FormLabel>
          <FormGroup>
            {assignmentCheckboxes()}
          </FormGroup>
        </FormControl>
        <FormControl sx={{ m: 3, mt: 3, minWidth: 280 }} variant='standard'>
          <InputLabel id='formulaLabel' shrink={true} sx={{ fontSize: '20px', mb: -2, position: 'relative' }}>Formula</InputLabel>
          <Select label='Formula' labelId='formulaLabel' value={formula} onChange={handleFormulaChange} defaultValue='Weighted average' data-testid='select'>
            { formulas.map((formula) => <MenuItem key={formula.name} value={formula.name} data-testid='select-option'>{formula.name}</MenuItem> ) }
          </Select>
        </FormControl>
        <StyledBox>
          <ViewFormulaAccordion codeSnippet={codeSnippet}/>
        </StyledBox>
        <StyledBox sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <Typography width={300} m={3}>Specify the attribute values for the sub-assignments now or leave it for later</Typography>
          <Box sx={{ m: 3, mt: 0, alignSelf: 'flex-end',display: 'flex', lexDirection: 'column', }}>
            <Button size='small' variant='contained' type='submit' name='specifyAttributes' sx={{ mr: 2 }}>
              Specify  attributes
            </Button>
            <Button size='small' variant='outlined' type='submit' name='skipAttributes' >
              Skip for now
            </Button>
          </Box>
        </StyledBox>
      </StyledBox>
    </form>
  );

};

SelectFormulaForm.propTypes = {
  assignments: PropTypes.array,
  formulas: PropTypes.array,
  instaceId: PropTypes.string,
};

export default SelectFormulaForm;