// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const LightLabelBoldValue = ({ label, value }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', columnGap: 1, mx: 1 }}>
      <Typography variant='body2'>{label + ':'}</Typography>
      <Typography variant='body2' sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  );
};
   
LightLabelBoldValue.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
};

export default LightLabelBoldValue;
