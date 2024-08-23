// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {GradingModelData} from '@/common/types';

export const mockGradingModel: GradingModelData = {
  id: 1,
  courseId: 1,
  coursePartId: null,
  name: 'Average',
  archived: false,
  hasArchivedCourseParts: false,
  hasDeletedCourseParts: false,
  // TODO
  graphStructure: {
    nodes: [],
    edges: [],
    nodeData: {},
  },
};
