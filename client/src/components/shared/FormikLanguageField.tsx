// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FormikProps} from 'formik';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import FormField from './FormikField';

type PropsType = {
  form: FormikProps<{[key: string]: unknown}>;
  valueFormat: string;
  labelFormat: string;
  helperTextFormat: string;
  disabled?: boolean;
};

// TODO: The logic of this component does not work well with (at least) Finnish grammar
const FormLanguagesField = ({
  form,
  valueFormat,
  labelFormat,
  helperTextFormat,
  disabled,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const languages = [
    {value: 'En', name: t('general.english')},
    {value: 'Fi', name: t('general.finnish')},
    {value: 'Sv', name: t('general.swedish')},
  ];

  return (
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
};

export default FormLanguagesField;
