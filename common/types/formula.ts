export enum Formula {
  Manual = 'MANUAL',
  WeightedAverage = 'WEIGHTED_AVERAGE',
}

export interface FormulaPreview {
  id: Formula;
  name: string;
  attributes: Array<string>;
  codeSnippet: string;
}
