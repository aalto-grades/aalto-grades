// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import formulasService from '../../services/formulas';

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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'flex-start', 
      alignItems: 'center', 
      marginLeft: margin, 
      columnGap: '15px', 
      pr: '21px', 
      minHeight: '36px', 
      maxHeight: '36px' 
    }}>
      <PanoramaFishEyeIcon sx={{ fontSize: '0.6rem', display: 'block', margin: '0px 0px 0px 2px' }} />
      {children}
    </Box>
  );
};

AccordionDetails.propTypes = {
  children: PropTypes.element,
  out: PropTypes.bool
};

const AssignmentText = ({ name, formulaId }) => {
  return (
    <Box sx={{ display: 'flex', 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%', 
      columnGap: 3 
    }}>
      <Typography variant='body2'>{name}</Typography>
      { formulaId 
        && <Typography variant='caption' align='left'>{'Formula: ' + formulasService.getFormulaName(formulaId)}</Typography>
      }
    </Box>
  );
};

AssignmentText.propTypes = {
  name: PropTypes.string,
  formulaId: PropTypes.number,
};

export { AccordionDetails, AssignmentText };

const CustomAccordion = ({ attainments }) => {

  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState('');

  const addToSet = (item, set) => {
    const copySet = new Set([...set]);
    return copySet.add(item);
  };
  
  const deleteFromSet = (item, set) => {
    const copySet = new Set([...set]);
    copySet.delete(item);
    return copySet;
  };

  // curried function syntax, google for a good explanation
  // basically add the panel's id to the set of expanded panels if opened, else delete from set
  const handleChange = (panel_id) => (e, newExpanded) => {
    setExpanded(newExpanded ? addToSet(panel_id, expanded) : deleteFromSet(panel_id, expanded));
    setSelected(newExpanded ? panel_id : false);
  };

  return (
    <>
      { attainments.map(attainment => {
        return (
          <Accordion 
            key={attainment.id + 'accordion'} 
            expanded={expanded.has(attainment.id)} 
            onChange={handleChange(attainment.id)}
          >
            <AccordionSummary 
              aria-controls={attainment.id + '-content'} 
              id={attainment.id + '-header'} 
              expanded={expanded.has(attainment.id).toString()} 
              nowselected={(selected === attainment.id).toString()}
            >
              <AssignmentText name={attainment.name} formulaId={attainment.formulaId} />
            </AccordionSummary>
            { attainment.subAttainments.map(subAttainment => {
              return (
                subAttainment.subAttainments.length === 0 ?  // is the attainment a leaf? If yes, render details, else another accordion
                  <AccordionDetails key={subAttainment.id + 'details'}>
                    <AssignmentText name={subAttainment.name} formulaId={subAttainment.formulaId} />
                  </AccordionDetails>
                  : 
                  <Box key={subAttainment.id + 'subAccordion'} sx={{ pl: '39px' }}>
                    {<CustomAccordion attainments={[subAttainment]} />}
                  </Box>
              );
            })}
          </Accordion>
        );
      })}
    </>
  );
};

CustomAccordion.propTypes = {
  attainments: PropTypes.array
};

export default CustomAccordion;