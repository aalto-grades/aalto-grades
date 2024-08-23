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
export type AverageNodeValue = {
  type: 'average';
  sources: {[key: string]: {isConnected: boolean; value: number}};
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
export type SinkNodeValue = {
  type: 'sink';
  source: number;
  value: number;
  courseFail: boolean;
};
export type SourceNodeValue = {
  type: 'source';
  source: number;
  value: number | 'fail';
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
  | AverageNodeValue
  | MaxNodeValue
  | MinPointsNodeValue
  | RequireNodeValue
  | RoundNodeValue
  | SinkNodeValue
  | SourceNodeValue
  | StepperNodeValue
  | SubstituteNodeValue;

export type NodeValues = {[key: string]: NodeValue};

// Types with schemas
const CustomNodeTypesSchema = z.enum([
  'addition',
  'average',
  'max',
  'minpoints',
  'require',
  'round',
  'sink',
  'source',
  'stepper',
  'substitute',
]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DropInNodesSchema = CustomNodeTypesSchema.exclude(['sink', 'source']);

const AverageNodeSettingsSchema = z.strictObject({
  weights: z.record(z.number()),
  percentageMode: z.boolean(),
});
const MaxNodeSettingsSchema = z.strictObject({
  minValue: z.number(),
});
const MinPointsNodeSettingsSchema = z.strictObject({
  minPoints: z.number(),
  onFailSetting: z.enum(['fullfail', 'fail']),
});
const RequireNodeSettingsSchema = z.strictObject({
  numFail: z.number(),
  onFailSetting: z.enum(['fullfail', 'fail']),
});
const RoundNodeSettingsSchema = z.strictObject({
  roundingSetting: z.enum(['round-up', 'round-closest', 'round-down']),
});
const SourceNodeSettingsSchema = z.strictObject({
  minPoints: z.union([z.number(), z.null()]),
  onFailSetting: z.enum(['fullfail', 'fail']),
});
const StepperNodeSettingsSchema = z.strictObject({
  numSteps: z.number(),
  outputValues: z.array(z.union([z.number(), z.literal('same')])),
  middlePoints: z.array(z.number()),
});
const SubstituteNodeSettingsSchema = z.strictObject({
  maxSubstitutions: z.number(),
  substituteValues: z.array(z.number()),
});

const NodeSettingsSchema = z.union([
  AverageNodeSettingsSchema,
  MaxNodeSettingsSchema,
  MinPointsNodeSettingsSchema,
  RequireNodeSettingsSchema,
  RoundNodeSettingsSchema,
  SourceNodeSettingsSchema,
  StepperNodeSettingsSchema,
  SubstituteNodeSettingsSchema,
]);
const NodeDataSchema = z.strictObject({
  title: z.string(),
  settings: NodeSettingsSchema.optional(),
});
const FullNodeDataSchema = z.record(z.string(), NodeDataSchema);

export const GraphStructureSchema = z.strictObject({
  nodes: z.array(
    // Not strict
    z.object({
      id: z.string(),
      position: z.object({x: z.number(), y: z.number()}),
      data: z.object({}),
      type: CustomNodeTypesSchema.optional(),

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
export type MaxNodeSettings = z.infer<typeof MaxNodeSettingsSchema>;
export type MinPointsNodeSettings = z.infer<typeof MinPointsNodeSettingsSchema>;
export type RequireNodeSettings = z.infer<typeof RequireNodeSettingsSchema>;
export type RoundNodeSettings = z.infer<typeof RoundNodeSettingsSchema>;
export type SourceNodeSettings = z.infer<typeof SourceNodeSettingsSchema>;
export type StepperNodeSettings = z.infer<typeof StepperNodeSettingsSchema>;
export type SubstituteNodeSettings = z.infer<
  typeof SubstituteNodeSettingsSchema
>;

export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type FullNodeData = z.infer<typeof FullNodeDataSchema>;

export type GraphStructure = z.infer<typeof GraphStructureSchema>;
