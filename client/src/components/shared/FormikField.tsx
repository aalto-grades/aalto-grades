import {TextField} from '@mui/material';
import {FormikProps} from 'formik';
import {HTMLInputTypeAttribute, PropsWithChildren, JSX} from 'react';

type PropsType = {
  form: FormikProps<{[key: string]: unknown}>;
  value: string;
  label: string;
  helperText: string;
  select?: boolean;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
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
}: PropsType & PropsWithChildren): JSX.Element => (
  <TextField
    id={value}
    name={value}
    type={type ?? 'text'}
    fullWidth
    value={form.values[value]}
    disabled={disabled || form.isSubmitting}
    label={label}
    InputLabelProps={{shrink: true}}
    margin="normal"
    helperText={form.errors[value] ? form.errors[value] : helperText}
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
