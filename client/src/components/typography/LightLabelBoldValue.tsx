// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function LightLabelBoldValue({ label, value, small }): JSX.Element {
  const textSize = small ? 'body2' : 'body1';

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
      alignItems: 'center', columnGap: 1, mx: 1
    }}>
      <Typography variant={textSize} >
        {label + ':'}
      </Typography>
      <Typography variant={textSize} sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  );
}

LightLabelBoldValue.propTypes = {
  label: PropTypes.string,
  small: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
};

export default LightLabelBoldValue;
