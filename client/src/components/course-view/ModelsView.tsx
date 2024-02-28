// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box} from '@mui/material';
import {JSX, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {
  useDeleteAssessmentModel,
  useEditAssessmentModel,
  useGetAllAssessmentModels,
} from '../../hooks/useApi';
import {GraphStructure} from '@common/types/graph';
import Graph from '../graph/Graph';

export default function ModelsView(): JSX.Element {
  const {courseId}: Params = useParams() as {courseId: string};
  const models = useGetAllAssessmentModels(courseId);
  const editModel = useEditAssessmentModel();
  const delModel = useDeleteAssessmentModel();
  const [initGraph, setInitGraph] = useState<GraphStructure>(
    {} as GraphStructure
  );
  const [initGraphId, setInitGraphId] = useState<number>(-1);

  const [open, setOpen] = useState(false);

  if (models.data === undefined) return <></>;

  const loadGraph = (id: number, graphStructure: GraphStructure): void => {
    setInitGraphId(id);
    setInitGraph(JSON.parse(JSON.stringify(graphStructure)));
    setOpen(true);
  };

  const handleDelModel = (assessmentModelId: number): void => {
    delModel.mutate({courseId, assessmentModelId});
  };

  const onChange = (graphStructure: GraphStructure): void => {
    let name = '';
    for (const item of models.data) {
      if (item.id === initGraphId) name = item.name;
    }

    editModel.mutate({
      courseId,
      assessmentModelId: initGraphId,
      assessmentModel: {
        name,
        graphStructure,
      },
    });
  };

  return (
    <Box sx={{border: '1px solid', width: '100%'}}>
      {models.data.map(item => (
        <div
          key={`graph-${item.id}-select`}
          style={{
            borderBottom: '1px dashed',
            padding: '3px 0px',
            marginBottom: '10px',
          }}
        >
          <h4 style={{display: 'inline', marginRight: '10px'}}>{item.name}</h4>
          <button
            onClick={() =>
              loadGraph(
                item.id as number,
                item.graphStructure as GraphStructure
              )
            }
          >
            Load model
          </button>
          <button onClick={() => handleDelModel(item.id as number)}>
            Delete model
          </button>
        </div>
      ))}
      {open && <Graph initGraph={initGraph} onChange={onChange} />}
    </Box>
  );
}
