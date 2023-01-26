// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid2 from '@mui/material/Unstable_Grid2';
import textFormatServices from '../../services/textFormat';
import DynamicTextFieldArray from './DynamicTextFieldArray';
import StringTextField from './StringTextFiled';
import NumberTextField from './NumberTextField';

// TODO: form handling 
// e.g. check that numbers, dates and emails are submited and nothing of the wrong format

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
  fieldLabel: 'Instance Teacher'
};

const EditInstanceForm = ({ instance }) => {

  const [courseType, setType]           = useState(instance.type);
  const [startDate, setStartDate]       = useState(textFormatServices.formatDateToString(instance.startDate));
  const [endDate, setEndDate]           = useState(textFormatServices.formatDateToString(instance.endDate));
  const [teachers, setTeachers]         = useState(instance.responsibleTeachers);
  const [minCredits, setMinCredits]     = useState(instance.courseData.minCredits);
  const [maxCredits, setMaxCredits]     = useState(instance.courseData.maxCredits);
  const [gradingScale, setGradingScale] = useState(instance.gradingScale);

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const basicInfoObject = ({
        courseType,
        startDate,
        endDate,
        teachers,
        credits,
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
        <Grid2 container spacing={2}>
          <Grid2 xs={6}><StringTextField fieldData={startDateData} value={startDate} setFunction={setStartDate}/></Grid2>
          <Grid2 xs={6}><StringTextField fieldData={endDateData} value={endDate} setFunction={setEndDate}/></Grid2>
        </Grid2>
        <DynamicTextFieldArray fieldData={teacherData} values={teachers} setFunction={setTeachers}/>
        <Grid2 container spacing={2}>
          <Grid2 xs={6}><NumberTextField fieldData={minCreditsData} value={minCredits} setFunction={setMinCredits}/></Grid2>
          <Grid2 xs={6}><NumberTextField fieldData={maxCreditsData} value={maxCredits} setFunction={setMaxCredits}/></Grid2>
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
