// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import StyledBox from '../select-formula-view/StyledBox';
import Assignment from './Assignment';
import AlertSnackbar from '../alerts/AlertSnackbar';

const FormulaAttributesForm = ({ navigateToCourseView, navigateBack }) => {

  const [attributeValues, setAttributeValues] = useState([]);
  const { selectedAttainments, selectedFormula } = useOutletContext();
  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  useEffect(() => {
    setAttributeValues(Array(selectedAttainments.length).fill(Array(selectedFormula.attributes.length).fill('')));
  }, [selectedAttainments, selectedFormula]);

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

  const handleAttributeChange = (attainmentIndex, attributeIndex, event) => {
    const newAttributeValues = attributeValues.map((a, index) => {
      if (attainmentIndex == index) {
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

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // TODO: add formula and attributes to database
      // Depending on how long adding the formula and attributes to the database takes,
      // a loading messsage may need to be added
      setSnackPack((prev) => [...prev,
        { msg: 'Formula attributes saved, you will be redirected to the course page.', severity: 'success' }
      ]);
      await sleep(4000);
      navigateToCourseView();

    } catch (exception) {
      console.log(exception);
      setSnackPack((prev) => [...prev,
        { msg: 'Saving the formula attributes failed.', severity: 'error' }
      ]);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid='attributeForm'>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
      <StyledBox sx={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        bgcolor: 'primary.light',
        borderRadius: 1,
        pt: 2
      }}>
        { selectedAttainments.map((attainment, attainmentIndex) =>
          <Assignment
            attainment={attainment}
            key={attainment.id}
            attainmentIndex={attainmentIndex}
            attributes={selectedFormula.attributes}
            handleAttributeChange={handleAttributeChange}
          />) }
      </StyledBox>
      <StyledBox sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ alignSelf: 'flex-end', m: '20px' }}>
          <Button size='medium' variant='outlined' sx={{ mr: 2 }} onClick={() => navigateBack()}>
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
  navigateToCourseView: PropTypes.func,
  navigateBack: PropTypes.func,
};

export default FormulaAttributesForm;