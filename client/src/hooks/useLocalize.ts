// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {useTranslation} from 'react-i18next';

import type {LocalizedString} from '@/common/types';

export const useLocalize = () => {
  const {i18n} = useTranslation();

  return (val: LocalizedString) =>
    ['en', 'fi', 'sv'].includes(i18n.language)
      ? val[i18n.language as 'en' | 'fi' | 'sv']
      : val.en;
};
