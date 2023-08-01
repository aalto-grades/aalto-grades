// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, Status } from 'aalto-grades-common/types';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { JSX, SyntheticEvent, useState } from 'react';

import { Accordion, AccordionSummary } from '../attainments/CustomAccordion';
import { State } from '../../types';

function GradeText(props: {
  name: string,
  tag: string,
  grade: number,
  status: Status
}): JSX.Element {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      columnGap: 10
    }}>
      <Typography variant='body2'>
        {`${props.name} (${props.tag})`}
      </Typography>
      <Typography variant='body2'>
        {'Grade: ' + (props.grade ? `${props.grade} - ${props.status}` : Status.Pending)}
      </Typography>
    </Box>
  );
}

GradeText.propTypes = {
  name: PropTypes.string,
  tag: PropTypes.string,
  grade: PropTypes.number,
  status: PropTypes.string,
};

export default function StudentGradeAccordion(props: {
  attainmentGrade: AttainmentGradeData
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

  const subAttainments: Array<AttainmentGradeData> | undefined =
    props.attainmentGrade.subAttainments;

  return (
    <>
      {
        (subAttainments && subAttainments.length > 0) ? (
          <Accordion
            key={props.attainmentGrade.attainmentId + 'accordion'}
            expanded={expanded.has(props.attainmentGrade.attainmentId ?? 0)}
            onChange={handleChange(props.attainmentGrade.attainmentId ?? 0)}
          >
            <AccordionSummary
              aria-controls={props.attainmentGrade.attainmentId + '-content'}
              id={props.attainmentGrade.attainmentId + '-header'}
              expanded={expanded.has(props.attainmentGrade.attainmentId ?? 0)}
              selected={(selected === props.attainmentGrade.attainmentId)}
            >
              <GradeText
                name={props.attainmentGrade.name as string}
                tag={props.attainmentGrade.tag as string}
                grade={props.attainmentGrade.grade}
                status={props.attainmentGrade.status}
              />
            </AccordionSummary>
            {
              subAttainments?.map((subAttainment: AttainmentGradeData) => {
                return (
                  <Box
                    key={subAttainment.attainmentId + 'subAccordion'}
                    sx={{ pl: '39px' }}
                  >
                    <StudentGradeAccordion
                      attainmentGrade={subAttainment}
                    />
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
            <GradeText
              name={props.attainmentGrade.name as string}
              tag={props.attainmentGrade.tag as string}
              grade={props.attainmentGrade.grade}
              status={props.attainmentGrade.status}
            />
          </Box>
        )
      }
    </>
  );
}

StudentGradeAccordion.propTypes = {
  attainment: PropTypes.object
};
