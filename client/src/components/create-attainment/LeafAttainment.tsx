// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SimpleDialog from './SimpleDialog';
import ConfirmationDialog from './ConfirmationDialog';
import StringTextField from './StringTextField';
import formulaServices from '../../services/formulas';
import { State, TextFieldData } from '../../types';
import { AttainmentData } from 'aalto-grades-common/types';

// An Assignmnet component without subAttainments and hence without a formula as well.
// If this isn't the root Attainment, this can be deleted

const nameData: TextFieldData = {
  fieldId: 'name',
  fieldLabel: 'Name'
};

const tagData: TextFieldData = {
  fieldId: 'tag',
  fieldLabel: 'Tag'
};

const daysValidData: TextFieldData = {
  fieldId: 'daysValid',
  fieldLabel: 'Days Valid'
};

/* String textfields for the formula attributes. These attributes affect the
   parent attainment's grade. The textfield IDs are of format 'attribute0',
   'attribute1' and so on. The numbers in the end are used to fill in the correct
   values of the 'formulaAttribute' property of an attainment. This is considered
   in the function of the nested component StringTextField.
*/
function AttributeTextFields({
  formulaAttributeNames, indices, setAttainments, attainments
}: any) {
  return (
    formulaAttributeNames.map((attribute: any) => {
      const attributeLabel = formulaServices.getAttributeLabel(attribute);
      return (
        <StringTextField
          key={attribute}
          fieldData={{ fieldId: 'attribute_' + attribute, fieldLabel: attributeLabel }}
          attainment={attainments}
          setAttainmentTree={setAttainments}
          attainmentTree={attainments}
          value={''}
        />
      );
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

function LeafAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData,
  formulaAttributeNames: Array<string>
}): JSX.Element {

  // Functions and variables for opening and closing the dialog that asks for
  // the number of sub-attainments
  const [openCountDialog, setOpenCountDialog]: State<boolean> = useState(false);

  function handleCountDialogOpen(): void {
    setOpenCountDialog(true);
  }

  function handleCountDialogClose(): void {
    setOpenCountDialog(false);
  }

  // Functions and varibales for opening and closing the dialog for confirming
  // sub-attainment deletion
  const [openConfDialog, setOpenConfDialog]: State<boolean> = useState(false);

  function handleConfDialogOpen(): void {
    setOpenConfDialog(true);
  }

  function handleConfDialogClose(): void {
    setOpenConfDialog(false);
  }

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
        <StringTextField
          attainmentTree={props.attainmentTree}
          setAttainmentTree={props.setAttainmentTree}
          attainment={props.attainment}
          value={props.attainment.name}
          fieldData={nameData}
        />
        <StringTextField
          attainmentTree={props.attainmentTree}
          setAttainmentTree={props.setAttainmentTree}
          attainment={props.attainment}
          value={props.attainment.tag}
          fieldData={tagData}
        />
        <StringTextField
          attainmentTree={props.attainmentTree}
          setAttainmentTree={props.setAttainmentTree}
          attainment={props.attainment}
          value={String(props.attainmentTree.daysValid)}
          fieldData={daysValidData}
        />
        {
          props.formulaAttributeNames &&
          <AttributeTextFields
            formulaAttributeNames={props.formulaAttributeNames}
            indices={[]}
            setAttainments={() => console.error('Temporary')}
            attainments={[]}
          />
        }
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {
          props.attainment !== props.attainmentTree ?
            <Button size='small' sx={{ my: 1 }} onClick={handleConfDialogOpen}>
              Delete
            </Button>
            :
            <Box sx={{ width: '1px' }} />
        }
        <ConfirmationDialog
          deleteAttainment={props.deleteAttainment}
          attainment={props.attainment}
          title={'Sub Study Attainments'}
          subject={'sub study attainment'}
          handleClose={handleConfDialogClose}
          open={openConfDialog}
        />
        {
          (props.attainment.subAttainments && props.attainment.subAttainments.length > 0)
            ?
            <Button size='small' sx={{ my: 1 }} onClick={handleCountDialogOpen}>
              Add Sub-Attainments
            </Button>
            :
            <Button size='small' sx={{ my: 1 }} onClick={handleCountDialogOpen}>
              Create Sub-Attainments
            </Button>
        }
      </Box>
      <SimpleDialog
        attainmentTree={props.attainmentTree}
        setAttainmentTree={props.setAttainmentTree}
        getTemporaryId={props.getTemporaryId}
        attainment={props.attainment}
        handleClose={handleCountDialogClose}
        open={openCountDialog}
      />
    </Box>
  );
}

LeafAttainment.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  deleteAttainment: PropTypes.func,
  getTemporaryId: PropTypes.func,
  attainment: PropTypes.object,
  formulaAttributeNames: PropTypes.array
};

export default LeafAttainment;
