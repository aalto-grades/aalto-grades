// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LeafAttainment from './LeafAttainment';
import Attainment from './Attainment';
import formulasService from '../../services/formulas';
import { AttainmentData, FormulaPreview } from 'aalto-grades-common/types';
import { State } from '../../types';

// An Assignmnet component with subAttainments and a formula

function ParentAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData,
  formulaAttributeNames: Array<string>
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  // For opening and closing the list of sub-attainments
  const [open, setOpen]: State<boolean> = useState(true);
  // Detailed information about the used formula, undefined when loading.
  const [formulaDetails, setFormulaDetails]: State<FormulaPreview | undefined> =
    useState(undefined);

  function handleClick(): void {
    setOpen(!open);
  }

  /* Functions to get the formula attributes.
   *
   * formulaId specifies the formula that is used to calculate this
   * attainment's grade, subFormulaAttributeNames are the attributes that need
   * to be specified for the direct sub attainments of this attainments,
   * so that the grade for this attainment can be calculated.
   *
   * Observe that formulaAttributeNames which is as a parameter for this
   * component are the attributes that need to specified for this attainment,
   * so that the grade of this attainment's parent attainment can be calculated.
   */
  useEffect(() => {
    formulasService.getFormulaDetails(props.attainmentTree.formula)
      .then((formula: FormulaPreview) => {
        setFormulaDetails(formula);
      });
  }, []);

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: 1
      }}>
        <Typography variant="body1" sx={{ flexGrow: 1, textAlign: 'left', mb: 0.5 }}>
          {'Grading Formula: ' + formulaDetails?.name ?? 'Loading...'}
        </Typography>
        {
          /* Navigation below doesn't work because formula selection has
             only been implemented for course grade */
        }
        <Button size='small' sx={{ mb: 0.5 }} onClick={(): void => navigate('/select-formula')}>
          Edit formula
        </Button>
      </Box>
      <LeafAttainment
        attainmentTree={props.attainmentTree}
        setAttainmentTree={props.setAttainmentTree}
        deleteAttainment={props.deleteAttainment}
        getTemporaryId={props.getTemporaryId}
        attainment={props.attainment}
        formulaAttributeNames={props.formulaAttributeNames}
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
                      formulaAttributeNames={
                        formulaDetails?.attributes ?? []
                      }
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
  attainment: PropTypes.any,
  formulaAttributeNames: PropTypes.array
};

export default ParentAttainment;
