// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
//import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
//import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
//import textFormatServices from '../../services/textFormat';

//const AccordionKinda = ({ assignments }) => {
//  const assignment = assignments[0];
//  const { type, description, points, weight, expiryDate } = assignment;
//  //const totalPoints = 50;
//
//  return (
//    <Box boxShadow={3} borderRadius={1} sx={{ pt: 1.5, pr: 1, pb: 1, pl: 3, width: '718px', bgcolor: 'white' }}>
//      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end' }}>
//        <Typography sx={{ fontWeight: 'bold', fontSize: '1.2em' }} align='left'>{type}</Typography>
//        <Typography variant='body2' align='left' sx={{ width: '130px', pr: 9 }}>{'Total points: ' + points}</Typography>
//      </Box>
//      <IconButton></IconButton>
//      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', mt: 1, mb: 1 }}>
//        <Typography align='left' sx={{ width: '240px', pr: 5 }}>{description}</Typography>
//        <Typography variant='body2' align='left' sx={{ width: '130px', pr: 9 }}>{'Total points: ' + points}</Typography>
//        <Typography variant='body2'>{'Weight: ' + Math.round(weight * 100) + ' %'}</Typography>
//      </Box>
//      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
//        <Typography align='left' variant='caption'>{'Expiry date: ' + textFormatServices.formatDateToString(expiryDate)}</Typography>
//        <Button>Edit</Button>
//      </Box>
//    </Box>
//  );
//};

const AssignmentText = ({ name, points }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', width: '100%', columnGap: 3 }}>
      <Typography variant='body2'>{name}</Typography>
      <Typography variant='caption' align='left'>{points + ' points'}</Typography>
    </Box>
  );
};

AssignmentText.propTypes = {
  name: PropTypes.string,
  points: PropTypes.number
};


const addToSet = (item, set) => {
  const copySet = new Set([...set]);
  return copySet.add(item);
};

const deleteFromSet = (item, set) => {
  const copySet = new Set([...set]);
  copySet.delete(item);
  return copySet;
};

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  '&:last-child': {
    borderBottom: '0px',
  },
  '&:before': {
    display: 'none',
  },
}));


//borderLeft:
//      nowselected === 'true'
//        ? `5px solid ${nowselected === 'true' ? theme.palette.primary.main : 'white'}`
//        : `0px solid ${nowselected === 'true' ? theme.palette.primary.main : 'white'}`,

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem', color: props.expanded === 'true' ? 'primary.main' : '#757575' }} />}
    {...props}
  />
))(({ theme, nowselected }) => ({
  maxHeight: '36px',
  minHeight: '36px',
  paddingRight: '21px',
  paddingLeft: '21px',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1.5),
  },
  '&:hover': {
    background: '#eaeaea',
  },
  '&:focus': {
    background: '#eaeaea',
    paddingLeft: nowselected === 'true' ? '16px' : '21px',
    borderLeft:
      nowselected === 'true'
        ? `5px solid ${nowselected === 'true' ? theme.palette.primary.main : 'white'}`
        : `0px solid ${nowselected === 'true' ? theme.palette.primary.main : 'white'}`,
  },
}));

const AccordionDetails = ({ out, children }) => {
  const margin = out ? '21px' : '60px';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: margin, gap: '8px', pr: '21px', minHeight: '36px', maxHeight: '36px' }}>
      <PanoramaFishEyeIcon sx={{ fontSize: '0.75rem', display: 'block', margin: '0px' }} />
      {children}
    </Box>
  );
};

AccordionDetails.propTypes = {
  children: PropTypes.element,
  out: PropTypes.bool
};

export { AccordionDetails, AssignmentText };

const CustomAccordion = ({ assignments, subBranch }) => {
  const assignment = assignments[0];
  //const { type, description, points, weight, expiryDate } = assignment;
  if(assignment) console.log('fun');

  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState('');

  // curried function syntax, google for a good explanation
  // basically add the panel's id to the set of expanded panels if it's opened, else delete
  // newExpanded is true if opening, false when closing
  const handleChange = (panel_id) => (e, newExpanded) => {
    console.log('this is newExpanded: ' + newExpanded);
    setExpanded(newExpanded ? addToSet(panel_id, expanded) : deleteFromSet(panel_id, expanded));
    setSelected(newExpanded ? panel_id : false);
  };

  //const handleClosing = (panel_id) => {
  //  console.log('close the sub-accordions of panel: ' + newExpanded);
  //  setExpanded(newExpanded ? addToSet(panel_id, expanded) : deleteFromSet(panel_id, expanded));
  //  setSelected(newExpanded ? panel_id : false);
  //};

  return (
    <>
      <Accordion expanded={expanded.has('panel1')} onChange={handleChange('panel1')}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" expanded={expanded.has('panel1').toString()} nowselected={(selected === 'panel1').toString()}>
          <AssignmentText name={'Project 1'} points={10} />
        </AccordionSummary>
        {subBranch !== undefined 
          ? <Box sx={{ pl: '39px' }}>{subBranch}</Box>
          : 
          <><AccordionDetails>
            <AssignmentText name={'Part 1'} points={10} />
          </AccordionDetails>
          <AccordionDetails>
            <AssignmentText name={'Part 2'} points={10} />
          </AccordionDetails></>}
      </Accordion>
      <Accordion expanded={expanded.has('panel2')} onChange={handleChange('panel2')}>
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header" expanded={expanded.has('panel2').toString()} nowselected={(selected === 'panel2').toString()}>
          <AssignmentText name={'Thing 2'} points={30} />
        </AccordionSummary>
        <AccordionDetails>
          <AssignmentText name={'Part 3'} points={10} />
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded.has('panel3')} onChange={handleChange('panel3')}>
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header" expanded={expanded.has('panel3').toString()} nowselected={(selected === 'panel3').toString()}>
          <AssignmentText name={'Thing 3'} points={100} />
        </AccordionSummary>
        <AccordionDetails>
          <AssignmentText name={'Part 4'} points={10} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

CustomAccordion.propTypes = {
  assignments: PropTypes.array,
  subBranch: PropTypes.element
};

export default CustomAccordion;