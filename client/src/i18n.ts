// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import i18n from 'i18next'; // eslint-disable-line import/no-named-as-default
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({fallbackLng: 'en'});

export default i18n;
