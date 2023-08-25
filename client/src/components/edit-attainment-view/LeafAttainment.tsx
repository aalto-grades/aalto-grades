// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { ChangeEvent, JSX, useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import ConfirmationDialog from './ConfirmationDialog';
import EditFormulaDialog from '../edit-formula-dialog/EditFormulaDialog';
import SimpleDialog from './SimpleDialog';

import { useGetFormula } from '../../hooks/useApi';
import { State } from '../../types';
import { getParamLabel } from '../../utils';

// An Assignmnet component without subAttainments and hence without a formula as well.
// If this isn't the root Attainment, this can be deleted

interface AttainmentTextFieldData {
  fieldId: keyof AttainmentData,
  fieldLabel: string
}

const nameData: AttainmentTextFieldData = {
  fieldId: 'name',
  fieldLabel: 'Name'
};

const daysValidData: AttainmentTextFieldData = {
  fieldId: 'daysValid',
  fieldLabel: 'Days Valid'
};

const minRequiredGradeData: AttainmentTextFieldData = {
  fieldId: 'minRequiredGrade',
  fieldLabel: 'Min Required Grade'
};

const maxGradeData: AttainmentTextFieldData = {
  fieldId: 'maxGrade',
  fieldLabel: 'Max Grade'
};

export default function LeafAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData,
  paramsFromParent?: object
}): JSX.Element {

  const { modification }: Params = useParams();

  const [editFormulaOpen, setEditFormulaOpen]: State<boolean> = useState(false);

  const formula: UseQueryResult<FormulaData> = useGetFormula(props.attainment.formula);

  // Functions and variables for opening and closing the dialog that asks for
  // the number of sub-attainments
  const [openCountDialog, setOpenCountDialog]: State<boolean> = useState(false);

  function handleCountDialogOpen(): void {
    setOpenCountDialog(true);
  }

  function handleCountDialogClose(): void {
    setOpenCountDialog(false);
  }

  // Functions and variables for opening and closing the dialog for confirming
  // sub-attainment deletion
  const [openConfirmationDialog, setOpenConfirmationDialog]: State<boolean> =
    useState(false);

  function handleConfirmationDialogOpen(): void {
    setOpenConfirmationDialog(true);
  }

  function handleConfirmationDialogClose(): void {
    setOpenConfirmationDialog(false);
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
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: 1
      }}>
        <EditFormulaDialog
          handleClose={(): void => setEditFormulaOpen(false)}
          open={editFormulaOpen}
          attainment={props.attainment}
          attainmentTree={props.attainmentTree}
          setAttainmentTree={props.setAttainmentTree}
        />
        <Typography variant="body1" sx={{ flexGrow: 1, textAlign: 'left', mb: 0.5 }}>
          {'Grading Formula: ' + formula.data?.name ?? 'Loading...'}
        </Typography>
        {
          /* Navigation below doesn't work because formula selection has
             only been implemented for course grade */
        }
        <Button
          size='small'
          sx={{ mb: 0.5 }}
          onClick={(): void => setEditFormulaOpen(true)}
        >
          Edit formula
        </Button>
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridTemplateRows: 'auto',
        columnGap: 3,
        rowGap: 1,
        mt: 2,
      }}>
        <TextField
          type='text'
          key={nameData.fieldId}
          id={nameData.fieldId}
          label={nameData.fieldLabel}
          InputLabelProps={{ shrink: true }}
          margin='normal'
          value={props.attainment.name}
          sx={{
            marginTop: 0,
            width: '100%'
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            props.attainment.name = event.target.value;
            props.setAttainmentTree(structuredClone(props.attainmentTree));
          }}
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
        <TextField
          type='number'
          key={minRequiredGradeData.fieldId}
          id={minRequiredGradeData.fieldId}
          label={minRequiredGradeData.fieldLabel}
          InputLabelProps={{ shrink: true }}
          margin='normal'
          value={props.attainment.minRequiredGrade}
          sx={{
            marginTop: 0,
            width: '100%'
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            props.attainment.minRequiredGrade = Number(event.target.value);
            props.setAttainmentTree(structuredClone(props.attainmentTree));
          }}
        />
        <TextField
          type='number'
          key={maxGradeData.fieldId}
          id={maxGradeData.fieldId}
          label={maxGradeData.fieldLabel}
          InputLabelProps={{ shrink: true }}
          margin='normal'
          value={props.attainment.maxGrade}
          sx={{
            marginTop: 0,
            width: '100%'
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            props.attainment.maxGrade = Number(event.target.value);
            props.setAttainmentTree(structuredClone(props.attainmentTree));
          }}
        />
      </Box>
      <Box sx={{ display: 'flex' }}>
        {
          (props.attainment.formulaParams) && (
            Object.keys(props.attainment.formulaParams).map((key: string) => {
              if (props.attainment.formulaParams && key !== 'children') {
                return (
                  <Paper key={key} variant='outlined' sx={{ mr: 1, px: 1, py: 0.5 }}>
                    <Typography align='left' variant='caption'>
                      {`${getParamLabel(key)}: ${props.attainment.formulaParams[key]}`}
                    </Typography>
                  </Paper>
                );
              }
            })
          )
        }
        {
          (props.paramsFromParent) && (
            Object.keys(props.paramsFromParent).map((key: string) => {
              if (props.paramsFromParent) {
                return (
                  <Paper key={key} variant='outlined' sx={{ mr: 1, px: 1, py: 0.5 }}>
                    <Typography align='left' variant='caption'>
                      {`${getParamLabel(key)}: ${props.paramsFromParent[key as keyof object]}`}
                    </Typography>
                  </Paper>
                );
              }
            })
          )
        }
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {
          (props.attainment !== props.attainmentTree) ? (
            <Button
              size='small'
              variant='outlined'
              color='error'
              sx={{ my: 1 }}
              onClick={handleConfirmationDialogOpen}
            >
              Delete
            </Button>
          ) : (
            modification == 'edit' ? (
              <Button
                size='small'
                variant='contained'
                color='error'
                onClick={(): void => setOpenConfirmationDialog(true)}
                sx={{ ml: 2 }}
              >
                Delete
              </Button>
            ) : (
              <Box sx={{ width: '1px' }} />
            )
          )
        }
        <ConfirmationDialog
          deleteAttainment={props.deleteAttainment}
          attainment={props.attainment}
          title={'Sub Study Attainments'}
          subject={'sub study attainment'}
          handleClose={handleConfirmationDialogClose}
          open={openConfirmationDialog}
          cannotBeUndone={
            Boolean(
              (modification === 'create') || (modification === 'edit' && (
                // This is the root attainment
                (props.attainment === props.attainmentTree) ||
                // Or this attainment is not in the database
                (props.attainment.id && props.attainment.id < 0)
              ))
            )
          }
        />
        {
          <Button
            size='small'
            variant='outlined'
            sx={{ my: 1 }}
            onClick={handleCountDialogOpen}
          >
            {
              (props.attainment.subAttainments && props.attainment.subAttainments.length > 0) ? (
                'Add Sub-Attainments'
              ) : (
                'Create Sub-Attainments'
              )
            }
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
