// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SimpleDialog from './SimpleDialog';
import ConfirmationDialog from './ConfirmationDialog';
import StringTextField from './StringTextField';
import DateTextField from './DateTextField';
import attainmentServices from '../../services/attainments';
import formulaService from '../../services/formulas';

// An Assignmnet component without subAttainments and hence without a formula as well.
// If this isn't the root Attainment, this can be deleted

const categoryData = {
  fieldId: 'category',
  fieldLabel: 'Name'
};

const nameData = {
  fieldId: 'attainmentName',
  fieldLabel: 'New Name'
};

const dateData = {
  fieldId: 'attainmentDate',
  fieldLabel: 'Date'
};

const expiryData = {
  fieldId: 'expiryDate',
  fieldLabel: 'Expiry Date'
};

/* String textfields for the formula attributes. These attributes affect the
   parent attainment's grade. The textfield IDs are of format 'attribute0',
   'attribute1' and so on. The numbers in the end are used to fill in the correct
   values of the 'formulaAttribute' property of an attainment. This is considered
   in the function of the nested component StringTextField.
*/
function AttributeTextFields({
  formulaAttributeNames, indices, setAttainments, attainments
}) {
  return (
    formulaAttributeNames.map((attribute) => {
      const attributeLabel = formulaService.getAttributeLabel(attribute);
      return (
        <StringTextField
          key={attribute}
          fieldData={{ fieldId: 'attribute_' + attribute, fieldLabel: attributeLabel }}
          indices={indices}
          setAttainments={setAttainments}
          attainments={attainments}
        />);
    })
  );
}

AttributeTextFields.propTypes = {
  formulaAttributeNames: PropTypes.array,
  indices: PropTypes.array,
  attainments: PropTypes.array,
  setAttainments: PropTypes.func,
  removeAttainment: PropTypes.func
};

function LeafAttainment({
  indices, addSubAttainments, setAttainments,
  attainments, removeAttainment, formulaAttributeNames
}) {

  // Functions and varibales for handling the change of the value in the 'Name'
  // (category) textfield. If the value is 'Other', then the 'New Name' textfield
  // is displayed; otherwise the name is the same as the category
  function handleChange(event) {
    const value = event.target.value;
    let updatedAttainments = attainmentServices.setProperty(
      indices, attainments, 'category', value
    );
    if (value === 'Other') {
      setDisplayNewName(true);
      updatedAttainments = attainmentServices.setProperty(
        indices, updatedAttainments, 'name', ''
      );
    } else {
      setDisplayNewName(false);
      updatedAttainments = attainmentServices.setProperty(
        indices, updatedAttainments, 'name', value
      );
    }
    setAttainments(updatedAttainments);
  }

  function getValue(fieldData) {
    if (fieldData.fieldId === 'category') {
      return attainmentServices.getProperty(indices, attainments, 'category');
    } else {
      console.log(fieldData.fieldId);
    }
  }

  const [displayNewName, setDisplayNewName] = useState<any>(
    getValue(categoryData) === 'Other'
  );

  // Functions and varibales for opening and closing the dialog that asks for
  // the number of sub-attainments
  const [openCountDialog, setOpenCountDialog] = useState<any>(false);

  function handleCountDialogOpen() {
    setOpenCountDialog(true);
  }

  function handleCountDialogClose() {
    setOpenCountDialog(false);
  }

  // Functions and varibales for opening and closing the dialog for confirming
  // sub-attainment deletion
  const [openConfDialog, setOpenConfDialog] = useState<boolean>(false);

  function handleConfDialogOpen() {
    setOpenConfDialog(true);
  }

  function handleConfDialogClose() {
    setOpenConfDialog(false);
  }

  // See if this attainment affects the parent attainment's grade
  const affectCalculation = attainmentServices.getProperty(
    indices, attainments, 'affectCalculation'
  );

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2,
      px: 3,
      py: 1,
      mb: 1
    }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridTemplateRows: 'auto',
        columnGap: 3,
        rowGap: 1,
        mt: 2,
      }}>
        <TextField
          id={categoryData.fieldId}
          label={categoryData.fieldLabel}
          variant='standard'
          value={getValue(categoryData)}
          onChange={(event) => handleChange(event)}
          InputLabelProps={{ shrink: true }}
          sx={{ textAlign: 'left' }}
          select>
          <MenuItem value='Attainments'>Attainments</MenuItem>
          <MenuItem value='Exam'>Exam</MenuItem>
          <MenuItem value='Project'>Project</MenuItem>
          <MenuItem value='Other'>Other</MenuItem>
        </TextField>
        <Collapse in={displayNewName} timeout={0} unmountOnExit>
          <StringTextField
            fieldData={nameData}
            indices={indices}
            setAttainments={setAttainments}
            attainments={attainments}
          />
        </Collapse>
        <DateTextField
          fieldData={dateData}
          indices={indices}
          setAttainments={setAttainments}
          attainments={attainments}
        />
        <DateTextField
          fieldData={expiryData}
          indices={indices}
          setAttainments={setAttainments}
          attainments={attainments}
        />
        {
          (formulaAttributeNames && affectCalculation) &&
          <AttributeTextFields
            formulaAttributeNames={formulaAttributeNames}
            indices={indices}
            setAttainments={setAttainments}
            attainments={attainments}
          />
        }
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        { JSON.stringify(indices) !== '[0]' ?
          <Button size='small' sx={{ my: 1 }} onClick={handleConfDialogOpen}>
            Delete
          </Button>
          :
          <Box sx={{ width: '1px' }}/> }
        <ConfirmationDialog
          title={'Sub Study Attainments'}
          subject={'sub study attainment'}
          open={openConfDialog}
          handleClose={handleConfDialogClose}
          deleteAttainment={removeAttainment}
          indices={indices}
          attainments={attainments}
        />
        {attainmentServices.getSubAttainments(indices, attainments).length === 0 ?
          <Button size='small' sx={{ my: 1 }} onClick={handleCountDialogOpen}>
            Create Sub-Attainments
          </Button>
          :
          <Button size='small' sx={{ my: 1 }} onClick={handleCountDialogOpen}>
            Add Sub-Attainments
          </Button>}
      </Box>
      <SimpleDialog
        open={openCountDialog}
        handleClose={handleCountDialogClose}
        addSubAttainments={addSubAttainments}
        indices={indices}
        attainments={attainments}
      />
    </Box>
  );
}

LeafAttainment.propTypes = {
  addSubAttainments: PropTypes.func,
  indices: PropTypes.array,
  attainments: PropTypes.array,
  setAttainments: PropTypes.func,
  removeAttainment: PropTypes.func,
  formulaAttributeNames: PropTypes.array,
};

export default LeafAttainment;
