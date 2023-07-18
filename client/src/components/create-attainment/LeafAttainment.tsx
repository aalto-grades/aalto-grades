// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

import ConfirmationDialog from './ConfirmationDialog';
import SimpleDialog from './SimpleDialog';
import StringTextField from './StringTextField';

import { State, TextFieldData } from '../../types';

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


export default function LeafAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData
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
          value={String(props.attainment.daysValid)}
          fieldData={daysValidData}
        />
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {
          (props.attainment !== props.attainmentTree) ?
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
  attainment: PropTypes.object
};
