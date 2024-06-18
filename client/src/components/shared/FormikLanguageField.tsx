// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FormikProps} from 'formik';
import {JSX} from 'react';

import FormField from './FormikField';

const languages = [
  {value: 'En', name: 'English'},
  {value: 'Fi', name: 'Finnish'},
  {value: 'Sv', name: 'Swedish'},
];
const FormLanguagesField = ({
  form,
  valueFormat,
  labelFormat,
  helperTextFormat,
  disabled,
}: {
  form: FormikProps<{[key: string]: unknown}>;
  valueFormat: string;
  labelFormat: string;
  helperTextFormat: string;
  disabled?: boolean;
}): JSX.Element => (
  <>
    {languages.map(language => (
      <FormField
        key={language.value}
        form={form}
        value={valueFormat.replace('%', language.value)}
        disabled={disabled || form.isSubmitting}
        label={labelFormat.replace('%', language.name)}
        helperText={helperTextFormat.replace('%', language.name)}
      />
    ))}
  </>
);

export default FormLanguagesField;
