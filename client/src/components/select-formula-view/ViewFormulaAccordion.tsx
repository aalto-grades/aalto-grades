// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import formulasService from '../../services/formulas';
import { Box, CircularProgress } from '@mui/material';
import { State } from '../../types';
import { Formula, FormulaPreview } from 'aalto-grades-common/types';
import PropTypes, { InferProps } from 'prop-types';

const HoverExpandMoreIcon = styled<any>(ExpandMoreIcon)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.hoverGrey1
  }
}));

function ViewFormulaAccordion(
  { formulaId }: InferProps<typeof ViewFormulaAccordion.propTypes>
): JSX.Element {
  const [codeSnippet, setCodeSnippet]: State<string | null> = useState(null);

  useEffect(() => {
    if (formulaId !== undefined) {
      formulasService.getFormulaDetails(formulaId)
        .then((data: FormulaPreview) => {
          setCodeSnippet(data.codeSnippet);
        })
        .catch((exception: Error) => console.log(exception.message));
    }
  }, [formulaId]);

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
            { formulaId === undefined ?
              <p>Select formula for previewing</p>
              :
              codeSnippet == null ?
                <Box
                  sx={{
                    margin: 'auto',
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex'
                  }}>
                  <CircularProgress />
                </Box>
                :
                <pre>
                  <code>{codeSnippet}</code>
                </pre>
            }
          </Container>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}

ViewFormulaAccordion.propTypes = {
  formulaId: PropTypes.oneOfType([
    PropTypes.oneOf(Object.values(Formula)),
    undefined
  ])
};

export default ViewFormulaAccordion;
