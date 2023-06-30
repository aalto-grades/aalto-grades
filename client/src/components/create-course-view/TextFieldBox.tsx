// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { Theme, useTheme } from '@mui/material/styles';

export interface TextFieldData {
  fieldId: string,
  fieldLabel: string,
  fieldHelperText: string
}

function TextFieldBox(props: {
  fieldData: TextFieldData,
  setFunction: (value: string) => void
}): JSX.Element {
  const theme: Theme = useTheme();

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2,
      my: 2,
      p: 2
    }}>
      <TextField
        id={props.fieldData.fieldId}
        type={props.fieldData.fieldId}
        label={props.fieldData.fieldLabel}
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
        helperText={props.fieldData.fieldHelperText}
        onChange={(
          { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
        ): void => props.setFunction(target.value)}>
      </TextField>
    </Box>
  );
}

TextFieldBox.propTypes = {
  fieldData: PropTypes.object,
  fieldId: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldHelperText: PropTypes.string,
  setFunction: PropTypes.func,
};

export default TextFieldBox;
