import {Edge, Node} from 'reactflow';

// Node values
export type DropInNodes =
  | 'addition'
  | 'average'
  | 'max'
  | 'minpoints'
  | 'require'
  | 'round'
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
  source: number;
  value: number | 'fail';
  courseFail: boolean;
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
  courseFail: boolean;
};
export type RequireNodeValue = {
  type: 'require';
  sources: {[key: string]: {isConnected: boolean; value: number | 'fail'}};
  values: {[key: string]: number | 'fail'};
  courseFail: boolean;
};
export type RoundNodeValue = {
  type: 'round';
  source: number;
  value: number;
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
  | RoundNodeValue
  | StepperNodeValue
  | SubstituteNodeValue;

export type NodeValues = {
  [key: string]: NodeValue;
};

// Node data
export type AverageNodeSettings = {
  weights: {[key: string]: number};
  percentageMode: boolean;
};
export type AttainmentNodeSettings = {
  minPoints: number;
  onFailSetting: 'coursefail' | 'fail';
};
export type MaxNodeSettings = {
  minValue: number;
};
export type MinPointsNodeSettings = {
  minPoints: number;
  onFailSetting: 'coursefail' | 'fail';
};
export type RequireNodeSettings = {
  numFail: number;
  onFailSetting: 'coursefail' | 'fail';
};
export type RoundNodeSettings = {
  roundingSetting: 'round-up' | 'round-closest' | 'round-down';
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
  | AttainmentNodeSettings
  | MaxNodeSettings
  | MinPointsNodeSettings
  | RequireNodeSettings
  | RoundNodeSettings
  | StepperNodeSettings
  | SubstituteNodeSettings;

export type NodeData = {title: string; settings?: NodeSettings};

export type FullNodeData = {[key: string]: NodeData};

export type GraphStructure = {
  nodes: Node[];
  edges: Edge[];
  nodeData: FullNodeData;
};
