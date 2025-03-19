// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {default as DOMPurify} from 'dompurify';
import type {FormikProps} from 'formik';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import FormField from './FormikField';

type PropsType = {
  form: FormikProps<{[key: string]: unknown}>;
  valueFormat: string;
  labelFormat: string;
  helperTextFormat: string;
  disabled?: boolean;
};
const FormLanguagesField = ({
  form,
  valueFormat,
  labelFormat,
  helperTextFormat,
  disabled = false,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const languages = [
    {value: 'En', name: t('general.in-english')},
    {value: 'Fi', name: t('general.in-finnish')},
    {value: 'Sv', name: t('general.in-swedish')},
  ];

  return (
    <>
      {languages.map(language => (
        <FormField
          key={language.value}
          form={form}
          value={DOMPurify.sanitize(valueFormat.replace(/%/g, language.value))}
          disabled={disabled || form.isSubmitting}
          label={DOMPurify.sanitize(labelFormat.replace(/%/g, language.name))}
          helperText={DOMPurify.sanitize(
            helperTextFormat.replace(/%/g, language.name)
          )}
        />
      ))}
    </>
  );
};

export default FormLanguagesField;
