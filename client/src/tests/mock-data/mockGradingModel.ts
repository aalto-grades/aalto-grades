// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradingModelData} from '@/common/types';

export const mockGradingModel: GradingModelData = {
  id: 1,
  courseId: 1,
  name: 'Average',
  archived: false,
  hasArchivedCourseParts: false,
  hasDeletedCourseParts: false,
  graphStructure: {
    nodes: [
      {id: 'final-grade', position: {x: 1201, y: 218}, data: {}, type: 'grade'},
      {
        id: 'coursepart-1',
        position: {x: 12, y: 12},
        data: {},
        type: 'coursepart',
      },
      {
        id: 'coursepart-2',
        position: {x: 12, y: 194},
        data: {},
        type: 'coursepart',
      },
      {
        id: 'coursepart-3',
        position: {x: 12, y: 376},
        data: {},
        type: 'coursepart',
      },
      {
        id: 'dnd-average-dndnode-0',
        position: {x: 439, y: 113},
        data: {},
        type: 'average',
      },
      {
        id: 'dnd-stepper-dndnode-1',
        position: {x: 810, y: 98},
        data: {},
        type: 'stepper',
      },
    ],
    edges: [
      {
        id: 'reactflow__edge-coursepart-1coursepart-1-source-dnd-average-dndnode-0dnd-average-dndnode-0-0',
        source: 'coursepart-1',
        target: 'dnd-average-dndnode-0',
        sourceHandle: 'coursepart-1-source',
        targetHandle: 'dnd-average-dndnode-0-0',
      },
      {
        id: 'reactflow__edge-coursepart-2coursepart-2-source-dnd-average-dndnode-0dnd-average-dndnode-0-1',
        source: 'coursepart-2',
        target: 'dnd-average-dndnode-0',
        sourceHandle: 'coursepart-2-source',
        targetHandle: 'dnd-average-dndnode-0-1',
      },
      {
        id: 'reactflow__edge-coursepart-3coursepart-3-source-dnd-average-dndnode-0dnd-average-dndnode-0-2',
        source: 'coursepart-3',
        target: 'dnd-average-dndnode-0',
        sourceHandle: 'coursepart-3-source',
        targetHandle: 'dnd-average-dndnode-0-2',
      },
      {
        id: 'reactflow__edge-dnd-average-dndnode-0dnd-average-dndnode-0-source-dnd-stepper-dndnode-1dnd-stepper-dndnode-1',
        source: 'dnd-average-dndnode-0',
        target: 'dnd-stepper-dndnode-1',
        sourceHandle: 'dnd-average-dndnode-0-source',
        targetHandle: 'dnd-stepper-dndnode-1',
      },
      {
        id: 'reactflow__edge-dnd-stepper-dndnode-1dnd-stepper-dndnode-1-source-final-gradefinal-grade',
        source: 'dnd-stepper-dndnode-1',
        target: 'final-grade',
        sourceHandle: 'dnd-stepper-dndnode-1-source',
        targetHandle: 'final-grade',
      },
    ],
    nodeData: {
      'final-grade': {title: 'Final Grade'},
      'coursepart-1': {
        title: 'Exercise 1',
        settings: {minPoints: 1, onFailSetting: 'coursefail'},
      },
      'coursepart-2': {
        title: 'Exercise 2',
        settings: {minPoints: 1, onFailSetting: 'coursefail'},
      },
      'coursepart-3': {
        title: 'Exam',
        settings: {minPoints: 5, onFailSetting: 'coursefail'},
      },
      'dnd-average-dndnode-0': {
        title: 'Average',
        settings: {
          weights: {
            'dnd-average-dndnode-0-0': 20,
            'dnd-average-dndnode-0-1': 20,
            'dnd-average-dndnode-0-2': 60,
          },
          percentageMode: true,
        },
      },
      'dnd-stepper-dndnode-1': {
        title: 'Stepper',
        settings: {
          numSteps: 6,
          outputValues: [0, 1, 2, 3, 4, 5],
          middlePoints: [1.6, 3.3, 5, 6.6, 8.3],
        },
      },
    },
  },
};
