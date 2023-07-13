// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect, SyntheticEvent } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import StyledBox from '../edit-formula-dialog/StyledBox';
import SubAttainment from './SubAttainment';
import AlertSnackbar from '../alerts/AlertSnackbar';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { sleep } from '../../utils';
import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { Message, State } from '../../types';

function SetFormulaParams(props: {
  attainment: AttainmentData,
  formula: FormulaData,
  formulaParams: object,
  setFormulaParams: (formulaParams: object) => void
}): JSX.Element {

  const [attributeValues, setAttributeValues]: State<Array<Array<string>>> =
    useState<Array<Array<string>>>([]);

  const [
    setSnackPack,
    messageInfo, setMessageInfo,
    alertOpen, setAlertOpen
  ]: SnackPackAlertState = useSnackPackAlerts();

  /*
  useEffect(() => {
    setAttributeValues(
      Array(selectedAttainments.length).fill(
        Array(selectedFormula.attributes.length).fill('')
      )
    );
  }, [selectedAttainments, selectedFormula]);

  function snackPackAdd(msg: Message): void {
    setSnackPack((prev: Array<Message>): Array<Message> => [...prev, msg]);
  }

  function handleAttributeChange(
    attainmentIndex: number, attributeIndex: number, event: any
  ): void {
    const newAttributeValues: Array<Array<string>> =
    attributeValues.map((a: Array<string>, index: number): Array<string> => {
      if (attainmentIndex == index) {
        const newParams: Array<string> = a.map((attribute: string, i: number): string => {
          return (attributeIndex == i) ? event.target.value : attribute;
        });
        return newParams;
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
          formulaParams: attributeObj
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

    } catch (exception) {
      console.log(exception);
      snackPackAdd({
        msg: 'Saving the formula attributes failed.',
        severity: 'error'
      });
    }
  }
  */

  return (
    <>
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
        {
          props.attainment.subAttainments?.map(
            (attainment: AttainmentData, attainmentIndex: number) => {
              return (
                <SubAttainment
                  attainment={attainment}
                  key={attainment.id}
                  attainmentIndex={attainmentIndex}
                  childParams={props.formula.childParams}
                  handleAttributeChange={/*handleAttributeChange*/() => console.log('Empty')}
                />
              );
            }
          )
        }
      </StyledBox>
    </>
  );
}

SetFormulaParams.propTypes = {
  attainment: PropTypes.object,
  formula: PropTypes.object,
  formulaParams: PropTypes.object,
  setFormulaParams: PropTypes.func
};

export default SetFormulaParams;
