// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Tooltip} from '@mui/material';
import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

import type {FrozenTaskGrade, GradingScale} from '@/common/types';
import {getGradeString} from '@/utils';
import {bestFrozenGrade} from '@/utils/frozen';

/** Render a single frozen task grade with details in a tooltip */
const FrozenGradeCell = ({
  grades,
  gradingScale,
}: {
  grades: FrozenTaskGrade[];
  gradingScale: GradingScale;
}): ReactNode => {
  const {t} = useTranslation();
  const best = bestFrozenGrade(grades);
  if (best === null) return '-';

  const tooltip = grades
    .map(
      grade =>
        `${getGradeString(t, gradingScale, grade.grade)} — ${new Date(
          grade.date
        ).toLocaleDateString()}`
    )
    .join('\n');

  return (
    <Tooltip
      title={(
        <span style={{whiteSpace: 'pre-line'}}>
          {tooltip}
        </span>
      )}
    >
      <span>{getGradeString(t, gradingScale, best)}</span>
    </Tooltip>
  );
};

export default FrozenGradeCell;
