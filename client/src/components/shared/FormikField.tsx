// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type FilledInputProps,
  type InputProps as InputPropsType,
  type OutlinedInputProps,
  TextField,
} from '@mui/material';
import type {FormikProps} from 'formik';
import type {HTMLInputTypeAttribute, JSX, PropsWithChildren} from 'react';

type PropsType = {
  form: FormikProps<{[key: string]: unknown}>;
  value: string;
  label: string;
  helperText?: string;
  select?: boolean;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
  InputProps?:
    | Partial<FilledInputProps>
    | Partial<OutlinedInputProps>
    | Partial<InputPropsType>
    | undefined;
};
const FormField = ({
  form,
  value,
  label,
  helperText,
  select,
  type,
  children,
  disabled,
  InputProps,
}: PropsType & PropsWithChildren): JSX.Element => (
  <TextField
    id={value}
    name={value}
    type={type ?? 'text'}
    fullWidth
    value={form.values[value] ?? ''} // Convert nulls in to empty values to prevent warnings
    disabled={disabled || form.isSubmitting}
    label={label}
    InputLabelProps={{shrink: true}}
    InputProps={InputProps}
    margin="normal"
    helperText={form.errors[value] ?? helperText}
    error={form.touched[value] && form.errors[value] !== undefined}
    onChange={form.handleChange}
    select={select}
    // SelectProps={{native: true}}
    sx={{textAlign: 'left'}}
  >
    {children}
  </TextField>
);

export default FormField;
