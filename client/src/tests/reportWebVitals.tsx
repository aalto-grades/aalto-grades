// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ReportCallback} from 'web-vitals';

export default function reportWebVitals(onPerfEntry: ReportCallback): void {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({onCLS, onFID, onFCP, onLCP, onTTFB}) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
}
