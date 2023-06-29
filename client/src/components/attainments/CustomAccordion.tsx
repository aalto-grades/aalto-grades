// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import formulasService from '../../services/formulas';
import { Formula } from 'aalto-grades-common/types';
import { State } from '../../types';

const Accordion = styled<any>((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  '&:last-child': {
    borderBottom: '0px',
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled<any>((props) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon sx={{
        fontSize: '0.9rem', color: props.expanded === 'true' ? 'primary.main' : 'grey.600'
      }} />
    }
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
  '&:focus': {
    background: theme.palette.hoverGrey2,
    paddingLeft: nowselected === 'true' ? '16px' : '21px',
    borderLeft:
      nowselected === 'true'
        ? `5px solid ${nowselected === 'true' ? theme.palette.primary.main : 'white'}`
        : `0px solid ${nowselected === 'true' ? theme.palette.primary.main : 'white'}`,
  },
  '&:hover': {
    background: theme.palette.hoverGrey1,
  },
}));

function AccordionDetails(
  { out, children }: InferProps<typeof AccordionDetails.propTypes>
): JSX.Element {
  const margin: string = out ? '21px' : '60px';
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
      <PanoramaFishEyeIcon sx={{
        fontSize: '0.6rem', display: 'block', margin: '0px 0px 0px 2px'
      }} />
      {children}
    </Box>
  );
}

AccordionDetails.propTypes = {
  children: PropTypes.element,
  out: PropTypes.bool
};

function AttainmentText(
  { name, formulaId }: InferProps<typeof AttainmentText.propTypes>
): JSX.Element {
  return (
    <Box sx={{ display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      columnGap: 3
    }}>
      <Typography variant='body2'>
        {name}
      </Typography>
      <Typography align='left' variant='body2'>
        {tag}
      </Typography>
      {
        formulaId &&
        <Typography variant='caption' align='left'>
          {'Formula: ' + formulasService.getFormulaName(formulaId)}
        </Typography>
      }
    </Box>
  );
}

AttainmentText.propTypes = {
  name: PropTypes.string,
  formulaId: PropTypes.number,
  tag: PropTypes.string,
  formulaId: Formula
};

export { AccordionDetails, AttainmentText };

function CustomAccordion(
  { attainments, attainmentKey }: InferProps<typeof CustomAccordion.propTypes>
): JSX.Element {

  const [expanded, setExpanded]: State<Set<unknown>> = useState(new Set());
  const [selected, setSelected]: State<string> = useState('');

  function addToSet(item, set) {
    const copySet = new Set([...set]);
    return copySet.add(item);
  }

  function deleteFromSet(item, set) {
    const copySet = new Set([...set]);
    copySet.delete(item);
    return copySet;
  }

  // curried function syntax, google for a good explanation
  // basically add the panel's id to the set of expanded panels if opened, else delete from set
  function handleChange(panel_id) {
    return (e, newExpanded) => {
      setExpanded(newExpanded ? addToSet(panel_id, expanded) : deleteFromSet(panel_id, expanded));
      setSelected(newExpanded ? panel_id : false);
    };
  }

  return (
    <>
      {
        attainments.map(attainment => {
          return (
            <Accordion
              key={attainment[attainmentKey] + 'accordion'}
              expanded={expanded.has(attainment[attainmentKey])}
              onChange={handleChange(attainment[attainmentKey])}
            >
              <AccordionSummary
                aria-controls={attainment[attainmentKey] + '-content'}
                id={attainment[attainmentKey] + '-header'}
                expanded={expanded.has(attainment[attainmentKey]).toString()}
                nowselected={(selected === attainment[attainmentKey]).toString()}
              >
                <AttainmentText
                  name={attainment.name}
                  formulaId={attainment.formulaId}
                  tag={attainment.tag}
                />
              </AccordionSummary>
              {
                attainment.subAttainments &&
                attainment.subAttainments.map(subAttainment => {
                  return (
                    // is the attainment a leaf? If yes, render details, else another accordion
                    subAttainment.subAttainments ?
                      <AccordionDetails key={subAttainment[attainmentKey] + 'details'}>
                        <AttainmentText
                          name={subAttainment.name}
                          formulaId={subAttainment.formulaId}
                          tag={subAttainment.tag}
                        />
                      </AccordionDetails>
                      :
                      <Box key={subAttainment[attainmentKey] + 'subAccordion'} sx={{ pl: '39px' }}>
                        {
                          <CustomAccordion
                            attainments={[subAttainment]}
                            attainmentKey={attainmentKey}
                          />
                        }
                      </Box>
                  );
                })
              }
            </Accordion>
          );
        })}
    </>
  );
}

CustomAccordion.propTypes = {
  attainments: PropTypes.array,
  attainmentKey: PropTypes.string
};

export default CustomAccordion;
