export const AverageAssessmentModelGraphStructure = {
  nodes: [
    {id: 'final-grade', position: {x: 1199, y: 181}, data: {}, type: 'grade'},
    {
      id: 'attainment-26',
      position: {x: 12, y: 12},
      data: {},
      type: 'attainment',
    },
    {
      id: 'attainment-27',
      position: {x: 12, y: 169},
      data: {},
      type: 'attainment',
    },
    {
      id: 'attainment-28',
      position: {x: 12, y: 326},
      data: {},
      type: 'attainment',
    },
    {id: 'average', position: {x: 437, y: 75}, data: {}, type: 'average'},
    {id: 'stepper', position: {x: 808, y: 60}, data: {}, type: 'stepper'},
  ],
  edges: [
    {
      id: 'attainment-26:-average:0',
      source: 'attainment-26',
      target: 'average',
      sourceHandle: 'attainment-26-source',
      targetHandle: 'average-0',
    },
    {
      id: 'attainment-27:-average:1',
      source: 'attainment-27',
      target: 'average',
      sourceHandle: 'attainment-27-source',
      targetHandle: 'average-1',
    },
    {
      id: 'attainment-28:-average:2',
      source: 'attainment-28',
      target: 'average',
      sourceHandle: 'attainment-28-source',
      targetHandle: 'average-2',
    },
    {
      id: 'average:-stepper:',
      source: 'average',
      target: 'stepper',
      sourceHandle: 'average-source',
      targetHandle: 'stepper',
    },
    {
      id: 'stepper:-final-grade:',
      source: 'stepper',
      target: 'final-grade',
      sourceHandle: 'stepper-source',
      targetHandle: 'final-grade',
    },
  ],
  nodeData: {
    average: {
      title: 'Average',
      settings: {
        weights: {'average-0': 33.3, 'average-1': 33.3, 'average-2': 33.3},
        percentageMode: true,
      },
    },
    stepper: {
      title: 'Convert to grade',
      settings: {
        numSteps: 6,
        outputValues: [0, 1, 2, 3, 4, 5],
        middlePoints: [1.7, 3.3, 5, 6.7, 8.3],
      },
    },
    'final-grade': {title: 'Final Grade'},
    'attainment-26': {
      title: 'Exercise 1',
      settings: {minPoints: 0, onFailSetting: 'coursefail'},
    },
    'attainment-27': {
      title: 'Exercise 2',
      settings: {minPoints: 0, onFailSetting: 'coursefail'},
    },
    'attainment-28': {
      title: 'Exam',
      settings: {minPoints: 0, onFailSetting: 'coursefail'},
    },
  },
};
