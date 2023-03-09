// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
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
import StyledBox from './StyledBox';
import ViewFormulaAccordion from './ViewFormulaAccordion';
import AlertSnackbar from '../alerts/AlertSnackbar';


const SelectFormulaForm = ({ assignments, formulas, navigateToCourseView, navigateToAttributeSelection }) => {

  const [codeSnippet, setCodeSnippet] = useState('');
  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  const {
    selectedAssignments, setSelectedAssignments,
    selectedFormula, setSelectedFormula
  } = useOutletContext();

  useEffect(() => {
    // set code snippet if user returns from attribute selection
    if (selectedFormula.name !== undefined) {
      setCodeSnippet(selectedFormula.codeSnippet);
    }
  }, []);

  useEffect(() => {
    // all attainments are checked at default -> add them to selected assignments
    if (selectedAssignments.length === 0) {
      setSelectedAssignments(assignments);
    }
  }, [assignments]);

  // useEffect in charge of handling the back-to-back alerts
  // makes the previous disappear before showing the new one
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  const handleFormulaChange = (event) => {
    const newFormula = formulas.find(formula => formula.name == event.target.value);
    setCodeSnippet(newFormula.codeSnippet);
    setSelectedFormula(newFormula);
  };

  // checks that user has selected a function and at least one attainment
  // if not, shows error message
  const canBeSubmitted = () => {
    if(selectedAssignments.length === 0 || selectedFormula.name === undefined) {
      setSnackPack((prev) => [...prev,
        { msg: 'You must select a formula and at least one study attainment.', severity: 'error' }
      ]);
      return false;
    }
    return true;
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (canBeSubmitted()) {
      try {
        // TODO: add formula to database
        setSnackPack((prev) => [...prev,
          { msg: 'Formula saved, you will be redirected to the course page.', severity: 'success' }
        ]);
        await sleep(4000);
        navigateToCourseView();

      } catch (exception) {
        console.log(exception);
        setSnackPack((prev) => [...prev,
          { msg: 'Saving the formula failed.', severity: 'error' }
        ]);
      }
    }
  };

  const handleCheckboxChange = (event) => {
    const selectedAssignment = assignments.find(assignment => assignment.name == event.target.name);
    if(event.target.checked) {
      setSelectedAssignments(prev => [...prev, selectedAssignment]);
    } else {
      setSelectedAssignments(prev => prev.filter(assignment => assignment !== selectedAssignment));
    }
  };

  const isChecked = (assignment) => {
    // If user has returned from attribute selection -> only assigments they previously selected are checked
    var i;
    for (i = 0; i < selectedAssignments.length; i++) {
      if (selectedAssignments[i] === assignment) {
        return true;
      }
    }
    return false;
  };

  const assignmentCheckboxes = () => {
    return (
      <>
        { assignments.map((assignment) => (
          <FormControlLabel key={assignment.id} control={
            <Checkbox name={assignment.name} onChange={handleCheckboxChange} checked={isChecked(assignment)}/>
          } label={assignment.name} />
        ))
        }
      </>
    );
  };

  return(
    <form onSubmit={handleSubmit}>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
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
          <FormLabel component='legend' focused={false} sx={{ color: '#000', mb:1.5 }}>Select the sub study attainments you want to include in the calculation</FormLabel>
          <FormGroup>
            {assignmentCheckboxes()}
          </FormGroup>
        </FormControl>
        <FormControl sx={{ m: 3, mt: 3, minWidth: 280 }} variant='standard'>
          <InputLabel id='formulaLabel' shrink={true} sx={{ fontSize: '20px', mb: -2, position: 'relative' }}>Formula</InputLabel>
          <Select label='Formula' labelId='formulaLabel' value={selectedFormula.name ?? ''} onChange={handleFormulaChange}>
            { formulas.map((formula) => <MenuItem key={formula.id} value={formula.name}>{formula.name}</MenuItem> ) }
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
          <Typography width={350} m={3}>Specify attribute values for the sub study attainments</Typography>
          <Box sx={{ m: 3, mt: 0, alignSelf: 'flex-end',display: 'flex', lexDirection: 'column', }}>
            <Button size='medium' variant='outlined' type='submit' name='skipAttributes' sx={{ mr: 2 }}>
              Skip for now
            </Button>
            <Button size='medium' variant='contained' onClick={ () => canBeSubmitted() && navigateToAttributeSelection() }>
              Specify  attributes
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
  navigateToCourseView: PropTypes.func,
  navigateToAttributeSelection: PropTypes.func,
};

export default SelectFormulaForm;