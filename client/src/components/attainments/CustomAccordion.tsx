// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula } from 'aalto-grades-common/types';
import { StyledComponent } from '@emotion/styled';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import {
  Accordion as MuiAccordion, AccordionSummary as MuiAccordionSummary, Box, Typography
} from '@mui/material';
import { AccordionProps } from '@mui/material/Accordion';
import { styled, Theme } from '@mui/material/styles';
import { JSX, ReactNode, SyntheticEvent, useState } from 'react';

import { State } from '../../types';

export const Accordion: StyledComponent<AccordionProps> = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  '&:last-child': {
    borderBottom: '0px',
  },
  '&:before': {
    display: 'none',
  },
}));

interface AccordionSummaryProps {
  'aria-controls': string,
  id: string,
  expanded: boolean,
  selected: boolean,
  children: ReactNode
}

export const AccordionSummary: StyledComponent<AccordionSummaryProps> = styled(
  (props: AccordionSummaryProps) => (
    <MuiAccordionSummary
      expandIcon={(
        <ArrowForwardIosSharpIcon
          sx={{
            fontSize: '0.9rem',
            color: props.expanded ? 'primary.main' : 'grey.600'
          }}
        />
      )}
      {...props}
    />
  )
) (({ theme, selected }: { theme: Theme, selected: boolean }) => ({
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

export default function CustomAccordion(props: {
  attainment: AttainmentData
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

  type AccordionOnChange = (event: SyntheticEvent, newExpanded: boolean) => void;

  // Curried function syntax. Add the panel's ID to the set of expanded panels
  // if opened, else delete from set
  function handleChange(panelId: number): AccordionOnChange {
    return (event: SyntheticEvent, newExpanded: boolean): void => {
      setExpanded(newExpanded ? addToSet(panelId, expanded) : deleteFromSet(panelId, expanded));
      setSelected(newExpanded ? panelId : 0);
    };
  }

  return (
    <>
      {
        (props.attainment.subAttainments && props.attainment.subAttainments.length > 0) ? (
          <Accordion
            key={props.attainment.id + 'accordion'}
            expanded={expanded.has(props.attainment.id ?? 0)}
            onChange={handleChange(props.attainment.id ?? 0)}
          >
            <AccordionSummary
              aria-controls={props.attainment.id + '-content'}
              id={props.attainment.id + '-header'}
              expanded={expanded.has(props.attainment.id ?? 0)}
              selected={(selected === props.attainment.id)}
            >
              <AttainmentText
                name={props.attainment.name}
                formulaId={props.attainment.formula ?? Formula.Manual}
                tag={props.attainment.tag}
              />
            </AccordionSummary>
            {
              props.attainment.subAttainments?.map((subAttainment: AttainmentData) => {
                return (
                  <Box
                    key={subAttainment.id + 'subAccordion'}
                    sx={{ pl: '39px' }}
                  >
                    {
                      <CustomAccordion
                        attainment={subAttainment}
                      />
                    }
                  </Box>
                );
              })
            }
          </Accordion>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginLeft: '21px',
            columnGap: '15px',
            pr: '21px',
            minHeight: '36px',
            maxHeight: '36px'
          }}>
            <PanoramaFishEyeIcon sx={{
              fontSize: '0.6rem', display: 'block', margin: '0px 0px 0px 2px'
            }} />
            <AttainmentText
              name={props.attainment.name}
              formulaId={props.attainment.formula ?? Formula.Manual}
              tag={props.attainment.tag}
            />
          </Box>
        )
      }
    </>
  );
}
