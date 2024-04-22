// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ReportCallback} from 'web-vitals';

const reportWebVitals = (onPerfEntry: ReportCallback): void => {
  if (onPerfEntry instanceof Function) {
    import('web-vitals').then(({onCLS, onFID, onFCP, onLCP, onTTFB}) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
