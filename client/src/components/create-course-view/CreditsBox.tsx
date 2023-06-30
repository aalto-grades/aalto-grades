// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes, { InferProps } from 'prop-types';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { Theme, useTheme } from '@mui/material/styles';

export interface TextFieldData {
  fieldId: string,
  fieldLabel: string,
  fieldHelperText: string
}

function CreditsBox(
  { setMaxCredits, setMinCredits, maxCredits, minCredits }: InferProps<typeof CreditsBox.propTypes>
): JSX.Element {
  const theme: Theme = useTheme();

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'flex-start',
      boxShadow: 2,
      borderRadius: 2,
      my: 2,
      p: 2
    }}>
      <TextField
        id="minCredits"
        type="minCredits"
        value={minCredits}
        label="Min Credits"
        variant='standard'
        color='primary'
        sx={{ my: 1, mr: 10 }}
        InputLabelProps={{
          shrink: true,
          style: {
            fontSize: theme.typography.h2.fontSize
          }
        }}
        InputProps={{
          style: {
            margin: '32px 0px 0px 0px'
          }
        }}
        helperText="Input min credits"
        onChange={(
          { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
        ): void => setMinCredits(target.value)}>
      </TextField>
      <TextField
        id="maxCredits"
        type="maxCredits"
        value={maxCredits}
        label="Max Credits"
        variant='standard'
        color='primary'
        sx={{ my: 1 }}
        InputLabelProps={{
          shrink: true,
          style: {
            fontSize: theme.typography.h2.fontSize
          }
        }}
        InputProps={{
          style: {
            margin: '32px 0px 0px 0px'
          }
        }}
        helperText="Input max credits"
        onChange={(
          { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
        ): void => setMaxCredits(target.value)}>
      </TextField>
    </Box>
  );
}

CreditsBox.propTypes = {
  setMaxCredits: PropTypes.func,
  setMinCredits: PropTypes.func,
  maxCredits: PropTypes.number,
  minCredits: PropTypes.number
};

export default CreditsBox;
