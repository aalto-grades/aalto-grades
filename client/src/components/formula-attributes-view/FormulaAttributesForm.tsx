// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect, SyntheticEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import StyledBox from '../select-formula-view/StyledBox';
import Attainment from './Attainment';
import AlertSnackbar from '../alerts/AlertSnackbar';
import useSnackPackAlerts from '../../hooks/useSnackPackAlerts';
import { sleep } from '../../utils';
import { Message, State } from '../../types';

function FormulaAttributesForm(props: {
  navigateToCourseView: () => void,
  navigateBack: () => void
}): JSX.Element {

  const [attributeValues, setAttributeValues]: State<Array<Array<string>>> =
    useState<Array<Array<string>>>([]);
  const { selectedAttainments, selectedFormula } = useOutletContext<any>();
  const [
    setSnackPack,
    messageInfo, setMessageInfo,
    alertOpen, setAlertOpen
  ]: any = useSnackPackAlerts();

  useEffect(() => {
    setAttributeValues(
      Array(selectedAttainments.length).fill(
        Array(selectedFormula.attributes.length).fill('')
      )
    );
  }, [selectedAttainments, selectedFormula]);

  function snackPackAdd(msg: Message): void {
    if (setSnackPack) {
      (setSnackPack as Function)(
        (prev: Array<Message>): Array<Message> => [...prev, msg]
      );
    }
  }

  function handleAttributeChange(
    attainmentIndex: number, attributeIndex: number, event: any
  ): void {
    const newAttributeValues: Array<Array<string>> =
    attributeValues.map((a: Array<string>, index: number): Array<string> => {
      if (attainmentIndex == index) {
        const newAttributes: Array<string> = a.map((attribute: string, i: number): string => {
          return (attributeIndex == i) ? event.target.value : attribute;
        });
        return newAttributes;
      } else {
        return a;
      }
    });
    setAttributeValues(newAttributeValues);
  }

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    try {
      const updatedAttainments: any =
      selectedAttainments.map((attainment: any, index: number): any => {
        const values: Array<string> = attributeValues[index];
        const attributeObj: any = {};
        selectedFormula.attributes.forEach((elem: any, i: number) => {
          attributeObj[elem] = values[i];
        });
        return {
          ...attainment,
          affectCalculation: true,
          formulaAttributes: attributeObj
        };
      });
      console.log(updatedAttainments);
      // TODO: add formula and attributes to database
      // Depending on how long adding the formula and attributes to the database takes,
      // a loading messsage may need to be added
      snackPackAdd({
        msg: 'Formula attributes saved, you will be redirected to the course page.',
        severity: 'success'
      });
      await sleep(4000);
      props.navigateToCourseView();

    } catch (exception) {
      console.log(exception);
      snackPackAdd({
        msg: 'Saving the formula attributes failed.',
        severity: 'error'
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid='attributeForm'>
      <AlertSnackbar
        messageInfo={messageInfo}
        setMessageInfo={setMessageInfo}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
      <StyledBox sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        bgcolor: 'primary.light',
        borderRadius: 1,
        pt: 2
      }}>
        { selectedAttainments.map((attainment: any, attainmentIndex: number) =>
          <Attainment
            attainment={attainment}
            key={attainment.id}
            attainmentIndex={attainmentIndex}
            attributes={selectedFormula.attributes}
            handleAttributeChange={handleAttributeChange}
          />) }
      </StyledBox>
      <StyledBox sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ alignSelf: 'flex-end', m: '20px' }}>
          <Button
            size='medium'
            variant='outlined'
            sx={{ mr: 2 }}
            onClick={(): void => props.navigateBack()}
          >
            Go back
          </Button>
          <Button size='medium' variant='contained' type='submit' name='confirm'>
            Confirm
          </Button>
        </Box>
      </StyledBox>

    </form>
  );
}

FormulaAttributesForm.propTypes = {
  navigateToCourseView: PropTypes.func,
  navigateBack: PropTypes.func,
};

export default FormulaAttributesForm;
