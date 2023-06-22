// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import formulaService from '../../services/formulas';

const Attainment = ({ attainment, attributes, handleAttributeChange, attainmentIndex }) => {

  function attributeTextFields() {
    return (
      attributes.map((attribute, attributeIndex) => {
        const attributeLabel = formulaService.getAttributeLabel(attribute);
        return (
          <TextField
            type='text'
            key={attribute}
            variant='standard'
            label={attributeLabel}
            InputLabelProps={{ shrink: true }}
            margin='normal'
            sx={{
              marginTop: 0,
              width: '100%'
            }}
            onChange={event => handleAttributeChange(attainmentIndex, attributeIndex, event)}
          />
        );
      })
    );
  }

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2,
      px: 3,
      pt: 1,
      pb: 1.5,
      width: 1,
      mx: 1.5,
      mb: 2
    }}>
      <Typography sx={{ fontWeight: 'bold', my: 1 }} align='left'>
        {attainment.name}
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridTemplateRows: 'auto',
        columnGap: 3,
        rowGap: 1,
        mt: 2,
      }}>
        { attributeTextFields() }
      </Box>
    </Box>
  );
};

Attainment.propTypes = {
  attainment: PropTypes.object,
  attributes: PropTypes.array,
  handleAttributeChange: PropTypes.func,
  attainmentIndex: PropTypes.number
};

export default Attainment;
