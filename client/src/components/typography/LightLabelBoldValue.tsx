// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Box, Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { JSX } from 'react';

export default function LightLabelBoldValue(props: {
  label: string,
  value: string | number,
  small?: boolean
}): JSX.Element {
  const textSize: Variant = props.small ? 'body2' : 'body1';

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
