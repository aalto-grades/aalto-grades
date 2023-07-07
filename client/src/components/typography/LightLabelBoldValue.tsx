// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function LightLabelBoldValue(props: {
  label: string,
  value: string | number,
  small: boolean
}): JSX.Element {
  const textSize = props.small ? 'body2' : 'body1';

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
      alignItems: 'center', columnGap: 1, mx: 1
    }}>
      <Typography variant={textSize} >
        {props.label + ':'}
      </Typography>
      <Typography variant={textSize} sx={{ fontWeight: 'bold' }}>
        {props.value}
      </Typography>
    </Box>
  );
}

LightLabelBoldValue.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  small: PropTypes.bool
};

export default LightLabelBoldValue;
