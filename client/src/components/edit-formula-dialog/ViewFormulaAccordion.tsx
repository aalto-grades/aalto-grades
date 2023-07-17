// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, FormulaData } from 'aalto-grades-common/types';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress,
  Container, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import formulaServices from '../../services/formulas';
import { State } from '../../types';

const HoverExpandMoreIcon = styled<any>(ExpandMore)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.hoverGrey1
  }
}));

export default function ViewFormulaAccordion(props: {
  formulaId: Formula | null
}): JSX.Element {
  const [codeSnippet, setCodeSnippet]: State<string | null> = useState<string | null>(null);

  useEffect(() => {
    if (props.formulaId) {
      formulaServices.getFormulaDetails(props.formulaId)
        .then((data: FormulaData) => {
          setCodeSnippet(data.codeSnippet);
        })
        .catch((exception: Error) => console.log(exception.message));
    }
  }, [props.formulaId]);

  return (
    <Container>
      <Accordion sx={{ boxShadow: 'none' }}>
        <AccordionSummary
          expandIcon={<HoverExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{ pl: 0 }}
        >
          <Typography>Preview of the formula</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'primary.light', p: '10px' }}>
          <Container disableGutters sx={{ overflowX: 'scroll' }}>
            {
              !props.formulaId ?
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
    PropTypes.oneOf(Object.values(Formula))
  ])
};
