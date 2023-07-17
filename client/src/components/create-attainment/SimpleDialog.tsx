// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import PropTypes from 'prop-types';
import { ChangeEvent, SyntheticEvent, useState } from 'react';

import { State, TextFieldData } from '../../types';

// A Dialog component for asking the number of sub-attainments

const numberData: TextFieldData = {
  fieldId: 'numberData',
  fieldLabel: 'Number of sub-attainments'
};

export default function SimpleDialog(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  getTemporaryId: () => number,
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

      const parentId: number | undefined =
        (props.attainment.id && props.attainment.id > 0)
          ? props.attainment.id
          : undefined;

      for (let n: number = 0; n < Number(numOfAttainments); n++) {
        props.attainment.subAttainments.push({
          id: props.getTemporaryId(),
          parentId: parentId,
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
      <Box sx={{ p: 2 }}>

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
            <Button
              size='medium'
              variant='contained'
              type='submit'
              disabled={error}
              onClick={(event: SyntheticEvent): void => handleSubmit(event)}
            >
              Confirm
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  getTemporaryId: PropTypes.func,
  attainment: PropTypes.object,
  handleClose: PropTypes.func,
  open: PropTypes.bool
};
