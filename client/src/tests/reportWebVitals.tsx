// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ReportHandler} from 'web-vitals';

export default function reportWebVitals(onPerfEntry: ReportHandler): void {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(
      ({
        getCLS,
        getFID,
        getFCP,
        getLCP,
        getTTFB,
      }: {
        getCLS: (
          onReport: ReportHandler,
          reportAllChanges?: boolean | undefined
        ) => void;
        getFID: (
          onReport: ReportHandler,
          reportAllChanges?: boolean | undefined
        ) => void;
        getFCP: (
          onReport: ReportHandler,
          reportAllChanges?: boolean | undefined
        ) => void;
        getLCP: (
          onReport: ReportHandler,
          reportAllChanges?: boolean | undefined
        ) => void;
        getTTFB: (onReport: ReportHandler) => void;
      }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }
    );
  }
}
