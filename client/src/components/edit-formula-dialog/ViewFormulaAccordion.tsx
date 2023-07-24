// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula, FormulaData } from 'aalto-grades-common/types';
import { StyledComponent } from '@emotion/styled';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress,
  Container, Typography
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { UseQueryResult } from '@tanstack/react-query';

import { useGetFormula } from '../../hooks/useApi';

const HoverExpandMoreIcon: StyledComponent<object> = styled(ExpandMore)(
  ({ theme }: { theme: Theme }) => ({
    '&:hover': {
      background: theme.palette.hoverGrey1
    }
  })
);

export default function ViewFormulaAccordion(props: {
  formulaId: Formula | null
}): JSX.Element {

  const formula: UseQueryResult<FormulaData> = useGetFormula(
    props.formulaId ?? Formula.Manual
  );

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
              !props.formulaId
                ? <p>Select formula for previewing</p>
                : ((!formula.data)
                  ?
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
                    <code>{formula.data.codeSnippet}</code>
                  </pre>
                )
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
