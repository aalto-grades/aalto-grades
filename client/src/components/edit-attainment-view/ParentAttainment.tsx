// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Collapse, IconButton, List, Typography } from '@mui/material';
import { JSX, useState } from 'react';

import Attainment from './Attainment';
import LeafAttainment from './LeafAttainment';

import { State } from '../../types';

// An attainment component with subAttainments and a formula

export default function ParentAttainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  deleteAttainment: (attainment: AttainmentData) => void,
  getTemporaryId: () => number,
  attainment: AttainmentData,
  paramsFromParent?: object,
}): JSX.Element {

  // For opening and closing the list of sub-attainments
  const [open, setOpen]: State<boolean> = useState(true);

  const childParams: Map<string, object> = new Map(
    props.attainment.formulaParams?.children
  );

  function handleClick(): void {
    setOpen(!open);
  }

  return (
    <>
      <LeafAttainment
        attainmentTree={props.attainmentTree}
        setAttainmentTree={props.setAttainmentTree}
        deleteAttainment={props.deleteAttainment}
        getTemporaryId={props.getTemporaryId}
        attainment={props.attainment}
        paramsFromParent={props.paramsFromParent}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {open ? (
          <IconButton size='small' onClick={handleClick} sx={{
            height: '32px', width: '32px', mr: 1
          }}>
            <ExpandLess sx={{ color: 'primary.main' }} />
          </IconButton>
        ) : (
          <IconButton size='small' onClick={handleClick} sx={{
            height: '32px', width: '32px', mr: 1
          }}>
            <ExpandMore sx={{ color: 'hoverGrey3' }} />
          </IconButton>
        )}
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
                (props.attainment.subAttainments) && (
                  props.attainment.subAttainments.map(
                    (subAttainment: AttainmentData, i: number) => (
                      <Attainment
                        key={i}
                        attainmentTree={props.attainmentTree}
                        setAttainmentTree={props.setAttainmentTree}
                        deleteAttainment={props.deleteAttainment}
                        getTemporaryId={props.getTemporaryId}
                        attainment={subAttainment}
                        paramsFromParent={childParams.get(subAttainment.name)}
                      />
                    )
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
