// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

// Types without schemas (not in API)
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

// Types with schemas
const CustomNodeTypesSchema = z.enum([
  'addition',
  'attainment',
  'average',
  'grade',
  'max',
  'minpoints',
  'require',
  'round',
  'stepper',
  'substitute',
]);
const DropInNodesSchema = CustomNodeTypesSchema.exclude([
  'attainment',
  'grade',
]);

const AverageNodeSettingsSchema = z.object({
  weights: z.record(z.number()),
  percentageMode: z.boolean(),
});
const AttainmentNodeSettingsSchema = z.object({
  minPoints: z.number(),
  onFailSetting: z.enum(['coursefail', 'fail']),
});
const MaxNodeSettingsSchema = z.object({
  minValue: z.number(),
});
const MinPointsNodeSettingsSchema = z.object({
  minPoints: z.number(),
  onFailSetting: z.enum(['coursefail', 'fail']),
});
const RequireNodeSettingsSchema = z.object({
  numFail: z.number(),
  onFailSetting: z.enum(['coursefail', 'fail']),
});
const RoundNodeSettingsSchema = z.object({
  roundingSetting: z.enum(['round-up', 'round-closest', 'round-down']),
});
const StepperNodeSettingsSchema = z.object({
  numSteps: z.number(),
  outputValues: z.array(z.union([z.number(), z.literal('same')])),
  middlePoints: z.array(z.number()),
});
const SubstituteNodeSettingsSchema = z.object({
  maxSubstitutions: z.number(),
  substituteValues: z.array(z.number()),
});

const NodeSettingsSchema = z.union([
  AverageNodeSettingsSchema,
  AttainmentNodeSettingsSchema,
  MaxNodeSettingsSchema,
  MinPointsNodeSettingsSchema,
  RequireNodeSettingsSchema,
  RoundNodeSettingsSchema,
  StepperNodeSettingsSchema,
  SubstituteNodeSettingsSchema,
]);
const NodeDataSchema = z.object({
  title: z.string(),
  settings: NodeSettingsSchema.optional(),
});
const FullNodeDataSchema = z.record(z.string(), NodeDataSchema);

export const GraphStructureSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      position: z.object({x: z.number(), y: z.number()}),
      data: z.object({}),
      type: z.string().optional(),

      // Will be removed in api
      dragging: z.any().optional(),
      selected: z.any().optional(),
      positionAbsolute: z.any().optional(),
      width: z.any().optional(),
      height: z.any().optional(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().nullable().optional(),
      targetHandle: z.string().nullable().optional(),
    })
  ),
  nodeData: FullNodeDataSchema,
});

// The types
export type DropInNodes = z.infer<typeof DropInNodesSchema>;
export type CustomNodeTypes = z.infer<typeof CustomNodeTypesSchema>;

export type AverageNodeSettings = z.infer<typeof AverageNodeSettingsSchema>;
export type AttainmentNodeSettings = z.infer<
  typeof AttainmentNodeSettingsSchema
>;
export type MaxNodeSettings = z.infer<typeof MaxNodeSettingsSchema>;
export type MinPointsNodeSettings = z.infer<typeof MinPointsNodeSettingsSchema>;
export type RequireNodeSettings = z.infer<typeof RequireNodeSettingsSchema>;
export type RoundNodeSettings = z.infer<typeof RoundNodeSettingsSchema>;
export type StepperNodeSettings = z.infer<typeof StepperNodeSettingsSchema>;
export type SubstituteNodeSettings = z.infer<
  typeof SubstituteNodeSettingsSchema
>;

export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type FullNodeData = z.infer<typeof FullNodeDataSchema>;

export type GraphStructure = z.infer<typeof GraphStructureSchema>;
