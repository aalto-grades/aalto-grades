// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LeafAssignment from './LeafAssignment';
import Assignment from './Assignment';
import subAssignmentServices from '../../services/assignments';

// An Assignmnet component with subassignments and a formula

const ParentAssignment = ({ indices, addSubAssignments, setAssignments, assignments, removeAssignment }) => {

  // Functions and varibales for opening and closing the list of sub-assignments
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: 1
      }}>
        <Typography variant="body1" component="div" sx={{ flexGrow: 1, textAlign: 'left', mb: 0.5 }}>
          Grading Formula: None
        </Typography>
        <Button size='small' sx={{ mb: 0.5 }}>
          Edit formula
        </Button>
      </Box>
      <LeafAssignment
        indices={indices}
        addSubAssignments={addSubAssignments}
        assignments={assignments} 
        setAssignments={setAssignments} 
        removeAssignment={removeAssignment}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {open ? 
          <IconButton size='small' onClick={handleClick} sx={{ height: '32px', width: '32px', mr: 1  }}>
            <ExpandLess sx={{ color: 'primary.main' }}/>
          </IconButton>
          : 
          <IconButton size='small' onClick={handleClick} sx={{ height: '32px', width: '32px', mr: 1 }}>
            <ExpandMore sx={{ color: 'rgba(0, 0, 0, 0.6)' }}/>
          </IconButton>}
        <Box sx={{ display: 'flex', flexDirection: 'column',  width: '100%' }}>
          <Collapse in={!open} unmountOnExit >
            <Typography variant="body2" component="div" sx={{ mt: 0.6, mb: 2, flexGrow: 1, textAlign: 'left', color: 'rgba(0, 0, 0, 0.6)' }}>
              See sub-assignments
            </Typography>
          </Collapse>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <List component="div" disablePadding>
              {subAssignmentServices.getSubAssignments(indices, assignments).map((item, i) => (
                <Assignment 
                  indices={indices.concat(i)}
                  key={i}
                  assignments={assignments} 
                  setAssignments={setAssignments} 
                  removeAssignment={removeAssignment}
                />
              ))}
            </List>
          </Collapse>
        </Box>
      </Box>
    </>
  );
};

ParentAssignment.propTypes = {
  addSubAssignments: PropTypes.func,
  indices: PropTypes.array,
  assignments: PropTypes.array,
  setAssignments: PropTypes.func,
  removeAssignment: PropTypes.func
};

export default ParentAssignment;