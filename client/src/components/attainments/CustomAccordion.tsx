// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import { AttainmentData, Formula } from 'aalto-grades-common/types';
import { State } from '../../types';

type AccordionOnChange = (e: unknown, newExpanded: Set<number>) => void;

const Accordion = styled((props: {
  key: string,
  expanded: boolean,
  onChange: AccordionOnChange
}) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  '&:last-child': {
    borderBottom: '0px',
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: {
  'aria-controls': string,
  id: string,
  expanded: boolean,
  selected: boolean
}) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon
        sx={{
          fontSize: '0.9rem',
          color: props.expanded ? 'primary.main' : 'grey.600'
        }}
      />
    }
    {...props}
  />
))(({ theme, selected }) => ({
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
    paddingLeft: selected ? '16px' : '21px',
    borderLeft:
      selected
        ? `5px solid ${selected ? theme.palette.primary.main : 'white'}`
        : `0px solid ${selected ? theme.palette.primary.main : 'white'}`,
  },
  '&:hover': {
    background: theme.palette.hoverGrey1,
  },
}));

function AccordionDetails(props: {
  out?: boolean,
  children: JSX.Element
}): JSX.Element {
  const margin: string = props.out ? '21px' : '60px';
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
      {props.children}
    </Box>
  );
}

AccordionDetails.propTypes = {
  children: PropTypes.element,
  out: PropTypes.bool
};

function AttainmentText(props: {
  name: string,
  formulaId: Formula,
  tag: string
}): JSX.Element {
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
        {props.name} ({props.tag})
      </Typography>
      <Typography align='left' variant='body2'>
        {'Formula: ' + props.formulaId}
      </Typography>
    </Box>
  );
}

AttainmentText.propTypes = {
  name: PropTypes.string,
  formulaId: PropTypes.string,
  tag: PropTypes.string,
};

export { AccordionDetails, AttainmentText };

function CustomAccordion(props: {
  attainments: Array<AttainmentData>
}): JSX.Element {

  const [expanded, setExpanded]: State<Set<number>> = useState(new Set());
  const [selected, setSelected]: State<number> = useState(0);

  function addToSet(item: number, set: Set<number>): Set<number> {
    const copySet: Set<number> = new Set(set);
    return copySet.add(item);
  }

  function deleteFromSet(item: number, set: Set<number>): Set<number> {
    const copySet: Set<number> = new Set(set);
    copySet.delete(item);
    return copySet;
  }

  // curried function syntax, google for a good explanation
  // basically add the panel's id to the set of expanded panels if opened, else delete from set
  function handleChange(panelId: number): AccordionOnChange {
    return (e: unknown, newExpanded: Set<number>): void => {
      setExpanded(newExpanded ? addToSet(panelId, expanded) : deleteFromSet(panelId, expanded));
      setSelected(newExpanded ? panelId : 0);
    };
  }

  return (
    <>
      {
        props.attainments.map((attainment: AttainmentData) => {
          return (
            <Accordion
              key={attainment.id + 'accordion'}
              expanded={expanded.has(attainment.id ?? 0)}
              onChange={handleChange(attainment.id ?? 0)}
            >
              <AccordionSummary
                aria-controls={attainment.id + '-content'}
                id={attainment.id + '-header'}
                expanded={expanded.has(attainment.id ?? 0)}
                selected={(selected === attainment.id)}
              >
                <AttainmentText
                  name={attainment.name}
                  formulaId={attainment.formula ?? Formula.Manual}
                  tag={attainment.tag}
                />
              </AccordionSummary>
              {
                attainment.subAttainments &&
                attainment.subAttainments.map((subAttainment: AttainmentData) => {
                  return (
                    // is the attainment a leaf? If yes, render details, else another accordion
                    subAttainment.subAttainments ?
                      <AccordionDetails key={subAttainment.id + 'details'}>
                        <AttainmentText
                          name={subAttainment.name}
                          formulaId={subAttainment.formula ?? Formula.Manual}
                          tag={subAttainment.tag}
                        />
                      </AccordionDetails>
                      :
                      <Box
                        key={subAttainment.id + 'subAccordion'}
                        sx={{ pl: '39px' }}
                      >
                        {
                          <CustomAccordion
                            attainments={[subAttainment]}
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
  attainments: PropTypes.array
};

export default CustomAccordion;
