// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { GradeOption } from 'aalto-grades-common/types';

type Resolve = (value: void | PromiseLike<void>) => void;

export function sleep(ms: number = 2000): Promise<void> {
  return new Promise((resolve: Resolve) => setTimeout(resolve, ms));
}

export function getParamLabel(labelKey: string): string {
  const splitString: Array<string> = labelKey.split(/(?=[A-Z])/);
  const label: string = splitString.join(' ');
  const capitalizedLabel: string = label.charAt(0).toUpperCase() + label.slice(1);
  return capitalizedLabel;
}

export function findBestGradeOption(options: Array<GradeOption>): GradeOption | null {
  let bestSoFar: GradeOption | null = null;
  for (const option of options) {
    if (!bestSoFar || option.grade > bestSoFar.grade)
      bestSoFar = option;
  }
  return bestSoFar;
}
