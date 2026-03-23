// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {ExternalSourceData} from '@/common/types';
import type ExternalSource from '../../database/models/externalSource';

export const parseExternalSource = (
  externalSource: ExternalSource
): ExternalSourceData =>
  (({
    id: externalSource.id,
    externalCourse: externalSource.externalCourse,
    externalServiceName: externalSource.externalServiceName,
    sourceInfo: externalSource.sourceInfo,
  }) as ExternalSourceData);
