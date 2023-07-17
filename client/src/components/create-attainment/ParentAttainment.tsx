// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, List, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Attainment from './Attainment';
import EditFormulaDialog from '../edit-formula-dialog/EditFormulaDialog';
import LeafAttainment from './LeafAttainment';

import formulaServices from '../../services/formulas';
import { State } from '../../types';

// An Assignmnet component with subAttainments and a formula

export default function ParentAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData
}): JSX.Element {

  // For opening and closing the list of sub-attainments
  const [open, setOpen]: State<boolean> = useState(true);
  // Detailed information about the used formula, undefined when loading.
  const [formulaDetails, setFormulaDetails]: State<FormulaData | null> =
    useState<FormulaData | null>(null);

  const [editFormulaOpen, setEditFormulaOpen]: State<boolean> = useState(false);

  function handleClick(): void {
    setOpen(!open);
  }

  function onChangeFormula(): void {
    if (props.attainment.formula) {
      formulaServices.getFormulaDetails(props.attainment.formula)
        .then((formula: FormulaData) => {
          setFormulaDetails(formula);
        });
    }
  }

  useEffect(() => {
    onChangeFormula();
  }, []);

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: 1
      }}>
        <EditFormulaDialog
          handleClose={() => setEditFormulaOpen(false)}
          onSubmit={onChangeFormula}
          open={editFormulaOpen}
          attainment={props.attainment}
          attainmentTree={props.attainmentTree}
          setAttainmentTree={props.setAttainmentTree}
        />
        <Typography variant="body1" sx={{ flexGrow: 1, textAlign: 'left', mb: 0.5 }}>
          {'Grading Formula: ' + formulaDetails?.name ?? 'Loading...'}
        </Typography>
        {
          /* Navigation below doesn't work because formula selection has
             only been implemented for course grade */
        }
        <Button size='small' sx={{ mb: 0.5 }} onClick={(): void => setEditFormulaOpen(true)}>
          Edit formula
        </Button>
      </Box>
      <LeafAttainment
        attainmentTree={props.attainmentTree}
        setAttainmentTree={props.setAttainmentTree}
        deleteAttainment={props.deleteAttainment}
        getTemporaryId={props.getTemporaryId}
        attainment={props.attainment}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {open ?
          <IconButton size='small' onClick={handleClick} sx={{
            height: '32px', width: '32px', mr: 1
          }}>
            <ExpandLess sx={{ color: 'primary.main' }} />
          </IconButton>
          :
          <IconButton size='small' onClick={handleClick} sx={{
            height: '32px', width: '32px', mr: 1
          }}>
            <ExpandMore sx={{ color: 'hoverGrey3' }} />
          </IconButton>}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Collapse in={!open} unmountOnExit >
            <Typography variant="body2" align='left' sx={{
              mt: 0.6, mb: 2, flexGrow: 1, color: 'hoverGrey3'
            }}>
              See sub-attainments
            </Typography>
          </Collapse>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <List disablePadding>
              {
                props.attainment.subAttainments && props.attainment.subAttainments.map(
                  (subAttainment: AttainmentData, i: number) => (
                    <Attainment
                      key={i}
                      attainmentTree={props.attainmentTree}
                      setAttainmentTree={props.setAttainmentTree}
                      deleteAttainment={props.deleteAttainment}
                      getTemporaryId={props.getTemporaryId}
                      attainment={subAttainment}
                    />
                  )
                )
              }
            </List>
          </Collapse>
        </Box>
      </Box>
    </>
  );
}

ParentAttainment.propTypes = {
  attainmentTree: PropTypes.any,
  setAttainmentTree: PropTypes.func,
  deleteAttainment: PropTypes.func,
  getTemporaryId: PropTypes.func,
  attainment: PropTypes.any
};
