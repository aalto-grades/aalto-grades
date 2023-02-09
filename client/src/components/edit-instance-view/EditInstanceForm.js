// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid2 from '@mui/material/Unstable_Grid2';
import DynamicTextFieldArray from './DynamicTextFieldArray';
import StringTextField from './StringTextField';
import NumberTextField from './NumberTextField';
import DateTextField from './DateTextField';
import textFormatServices from '../../services/textFormat';

// Should the teachers be given as emails?
// Now they are given as full names
// TODO: check that no text field is left empty

const typeData = {
  fieldId: 'instanceType',
  fieldLabel: 'Type'
};

const startDateData = {
  fieldId: 'startDate',
  fieldLabel: 'Starting Date'
};

const endDateData = {
  fieldId: 'endDate',
  fieldLabel: 'Ending Date'
};

const minCreditsData = {
  fieldId: 'minCredits',
  fieldLabel: 'Min Credits'
};

const maxCreditsData = {
  fieldId: 'maxCredits',
  fieldLabel: 'Max Credits'
};

const gradingScaleData = {
  fieldId: 'gradingScale',
  fieldLabel: 'Grading Scale'
};

const teacherData = {
  fieldId: 'teacher',
  fieldLabel: 'Teacher of This Instance'
};

const textFieldMinWidth = 195;

const EditInstanceForm = ({ instance }) => {

  const [courseType, setType]             = useState(textFormatServices.formatCourseType(instance.courseType));
  const [startDate, setStartDate]         = useState(instance.startDate);
  const [endDate, setEndDate]             = useState(instance.endDate);
  const [teachers, setTeachers]           = useState(instance.responsibleTeachers);
  const [stringMinCredits, setMinCredits] = useState(String(instance.minCredits));
  const [stringMaxCredits, setMaxCredits] = useState(String(instance.maxCredits));
  const [gradingScale, setGradingScale]   = useState(textFormatServices.formatGradingType(instance.gradingType));

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const minCredits = Number(stringMinCredits);
      const maxCredits = Number(stringMaxCredits);
      const basicInfoObject = ({
        courseType,
        startDate,
        endDate,
        teachers,
        minCredits,
        maxCredits,
        gradingScale,
      });
      console.log(basicInfoObject);
      // TODO: possibly save instance information to DB 
      // (save info at least somewhere until the creation of the instance is done or disrupted)
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
        <StringTextField fieldData={typeData} value={courseType} setFunction={setType}/>
        <Grid2 container>
          <Grid2 sx={{ minWidth: textFieldMinWidth }}><DateTextField fieldData={startDateData} value={startDate} setFunction={setStartDate} minWidth={textFieldMinWidth}/></Grid2>
          <Box sx={{ width: 15 }}/>
          <Grid2 sx={{ minWidth: textFieldMinWidth }}><DateTextField fieldData={endDateData} value={endDate} setFunction={setEndDate} minWidth={textFieldMinWidth}/></Grid2>
        </Grid2>
        <DynamicTextFieldArray fieldData={teacherData} values={teachers} setFunction={setTeachers}/>
        <Grid2 container>
          <Grid2 sx={{ minWidth: textFieldMinWidth }}><NumberTextField fieldData={minCreditsData} value={stringMinCredits} setFunction={setMinCredits}/></Grid2>
          <Box sx={{ width: 15 }}/>
          <Grid2 sx={{ minWidth: textFieldMinWidth }}><NumberTextField fieldData={maxCreditsData} value={stringMaxCredits} setFunction={setMaxCredits}/></Grid2>
        </Grid2>
        <StringTextField fieldData={gradingScaleData} value={gradingScale} setFunction={setGradingScale}/>
      </Box>
      <Button size='small' variant='contained' type='submit'>
          Confirm Details
      </Button>
    </form>
  );
};

EditInstanceForm.propTypes = {
  instance: PropTypes.object,
};

export default EditInstanceForm;
