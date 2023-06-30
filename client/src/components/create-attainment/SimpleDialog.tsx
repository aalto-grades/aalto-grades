// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { ChangeEvent, SyntheticEvent, useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { State, TextFieldData } from '../../types';
import { AttainmentData } from 'aalto-grades-common/types';

// A Dialog component for asking the number of sub-attainments

const numberData: TextFieldData = {
  fieldId: 'numberData',
  fieldLabel: 'Number of sub-attainments'
};

function SimpleDialog(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  attainment: AttainmentData,
  handleClose: () => void,
  open: boolean,
}): JSX.Element {

  const [numOfAttainments, setNumOfAttainments]: State<number> = useState(1);

  // The value given should be an integer of one or higher
  const error: boolean = !(
    !isNaN(numOfAttainments)
    && (Number.isInteger(numOfAttainments))
    && (numOfAttainments >= 1)
  );

  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault();
    try {
      if (!props.attainment.subAttainments)
        props.attainment.subAttainments = [];

      for (let n: number = 0; n < Number(numOfAttainments); n++) {
        props.attainment.subAttainments.push({
          name: '',
          tag: '',
          daysValid: 0
        });
      }

      props.setAttainmentTree(structuredClone(props.attainmentTree));

      props.handleClose();
    } catch (exception) {
      console.log(exception);
    }
  }

  return (
    <Dialog open={props.open} >
      {
        (props.attainment.subAttainments && props.attainment.subAttainments.length > 0)
          ? <DialogTitle>Add Sub Study Attainments</DialogTitle>
          : <DialogTitle>Create Sub Study Attainments</DialogTitle>
      }
      <form>
        <DialogContent sx={{ px: 3, py: 1 }}>
          <TextField
            key={numberData.fieldId}
            id={numberData.fieldId}
            type='text'
            label={numberData.fieldLabel}
            InputLabelProps={{ shrink: true }}
            margin='normal'
            inputProps={{ min: 1, maxLength: 2, inputMode: 'numeric', pattern: '[0-9]*' }}
            value={numOfAttainments}
            error={error}
            helperText={error ? 'Value needs to be a positive integer' : ''}
            sx={{ width: '100%' }}
            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
              setNumOfAttainments(Number(event.target.value));
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button size='medium' onClick={props.handleClose}>
            Cancel
          </Button>
          <Button size='medium' variant='outlined' type='submit' onClick={
            (event: SyntheticEvent): void => {
              if (!error) {
                handleSubmit(event);
              }
            }
          }>
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  attainment: PropTypes.object,
  handleClose: PropTypes.func,
  open: PropTypes.bool
};

export default SimpleDialog;
