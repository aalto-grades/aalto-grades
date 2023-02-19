// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Container from '@mui/material/Container';
import styled from 'styled-components';

const HoverExpandMoreIcon = styled(ExpandMoreIcon)`
  &:hover {
    background: #f4f4f4;
  }
`;

const ViewFormulaAccordion = ({ codeSnippet }) => {

  return (
    <Container>
      <Accordion sx ={{ boxShadow: 'none' }}>
        <AccordionSummary
          expandIcon={<HoverExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx ={{ pl: 0 }}
        >
          <Typography>Preview of the formula</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'primary.light', p:'10px' }}>
          <Container disableGutters sx={{ overflowX: 'scroll' }}>
            <pre>
              <code>{codeSnippet}</code>
            </pre>
          </Container>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

ViewFormulaAccordion.propTypes = {
  codeSnippet: PropTypes.string,
};

export default ViewFormulaAccordion;