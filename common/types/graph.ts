import {Edge, Node} from 'reactflow';

// Node values
export type DropInNodes =
  | 'addition'
  | 'average'
  | 'max'
  | 'minpoints'
  | 'require'
  | 'stepper'
  | 'substitute';

export type CustomNodeTypes = DropInNodes | 'attainment' | 'grade';

export type AdditionNodeValue = {
  type: 'addition';
  sources: {[key: string]: {isConnected: boolean; value: number}};
  value: number;
};
export type AttainmentNodeValue = {
  type: 'attainment';
  value: number;
};
export type AverageNodeValue = {
  type: 'average';
  sources: {[key: string]: {isConnected: boolean; value: number}};
  value: number;
};
export type GradeNodeValue = {
  type: 'grade';
  source: number;
  value: number;
};
export type MaxNodeValue = {
  type: 'max';
  sources: {[key: string]: {isConnected: boolean; value: number}};
  value: number;
};
export type MinPointsNodeValue = {
  type: 'minpoints';
  source: number;
  value: number | 'fail';
};
export type RequireNodeValue = {
  type: 'require';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
  values: {[key: string]: number};
  courseFail: boolean;
};
export type StepperNodeValue = {
  type: 'stepper';
  source: number;
  value: number;
};
export type SubstituteNodeValue = {
  type: 'substitute';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
  values: {[key: string]: number | 'fail'};
};

export type NodeValue =
  | AdditionNodeValue
  | AttainmentNodeValue
  | AverageNodeValue
  | GradeNodeValue
  | MaxNodeValue
  | MinPointsNodeValue
  | RequireNodeValue
  | StepperNodeValue
  | SubstituteNodeValue;

export type NodeValues = {
  [key: string]: NodeValue;
};

// Node data
export type AverageNodeSettings = {
  weights: {[key: string]: number};
};
export type MaxNodeSettings = {
  minValue: number;
};
export type MinPointsNodeSettings = {
  minPoints: number;
};
export type RequireNodeSettings = {
  numFail: number;
  failSetting: 'ignore' | 'coursefail';
};
export type StepperNodeSettings = {
  numSteps: number;
  outputValues: (number | 'same')[];
  middlePoints: number[];
};
export type SubstituteNodeSettings = {
  maxSubstitutions: number;
  substituteValues: number[];
};

export type NodeSettings =
  | AverageNodeSettings
  | MaxNodeSettings
  | MinPointsNodeSettings
  | RequireNodeSettings
  | StepperNodeSettings
  | SubstituteNodeSettings;

export type NodeData = {title: string; settings?: NodeSettings};

export type FullNodeData = {[key: string]: NodeData};

export type GraphStructure = {
  nodes: Node[];
  edges: Edge[];
  nodeData: FullNodeData;
};
