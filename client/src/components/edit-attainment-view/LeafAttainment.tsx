// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { Box, Button, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { ChangeEvent, useState } from 'react';

import ConfirmationDialog from './ConfirmationDialog';
import SimpleDialog from './SimpleDialog';
import StringTextField, { AttainmentTextFieldData } from './StringTextField';

import { State } from '../../types';
import { getParamLabel } from '../../utils';

// An Assignmnet component without subAttainments and hence without a formula as well.
// If this isn't the root Attainment, this can be deleted

const nameData: AttainmentTextFieldData = {
  fieldId: 'name',
  fieldLabel: 'Name'
};

const tagData: AttainmentTextFieldData = {
  fieldId: 'tag',
  fieldLabel: 'Tag'
};

const daysValidData: AttainmentTextFieldData = {
  fieldId: 'daysValid',
  fieldLabel: 'Days Valid'
};

export default function LeafAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData,
  paramsFromParent?: object
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
        <TextField
          type='number'
          key={daysValidData.fieldId}
          id={daysValidData.fieldId}
          label={daysValidData.fieldLabel}
          InputLabelProps={{ shrink: true }}
          margin='normal'
          value={props.attainment.daysValid}
          sx={{
            marginTop: 0,
            width: '100%'
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            props.attainment.daysValid = Number(event.target.value);
            props.setAttainmentTree(structuredClone(props.attainmentTree));
          }}
        />
      </Box>
      <code>{JSON.stringify(props.attainment.formulaParams)}</code>
      {
        (props.attainment.formulaParams) && (
          Object.keys(props.attainment.formulaParams).map((key: string) => {
            if (props.attainment.formulaParams && key !== 'children') {
              return (
                <p key={key}>
                  {`${getParamLabel(key)}: ${props.attainment.formulaParams[key]}`}
                </p>
              );
            }
          })
        )
      }
      {
        (props.paramsFromParent) && (
          Object.keys(props.paramsFromParent).map((key: string) => {
            if (props.paramsFromParent) {
              console.log(`${key}, ${props.attainment.tag}`);
              return (
                <p key={key}>
                  {`${getParamLabel(key)}: ${props.paramsFromParent[key as keyof object]}`}
                </p>
              );
            }
          })
        )
      }
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {
          (props.attainment !== props.attainmentTree) ? (
            <Button size='small' sx={{ my: 1 }} onClick={handleConfDialogOpen}>
              Delete
            </Button>
          ) : (
            <Box sx={{ width: '1px' }} />
          )
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
          (props.attainment.subAttainments && props.attainment.subAttainments.length > 0) ? (
            <Button size='small' sx={{ my: 1 }} onClick={handleCountDialogOpen}>
              Add Sub-Attainments
            </Button>
          ) : (
            <Button size='small' sx={{ my: 1 }} onClick={handleCountDialogOpen}>
              Create Sub-Attainments
            </Button>
          )
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
