// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData, AttainmentData, Formula, FormulaData
} from 'aalto-grades-common/types';
import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, JSX } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import AttainmentCategory from '../attainments/AttainmentCategory';
import EditFormulaDialog from '../edit-formula-dialog/EditFormulaDialog';
import MenuButton, { MenuButtonOption } from './MenuButton';

import { useGetFormula } from '../../hooks/useApi';
import { State } from '../../types';

export default function Attainments(props: {
  attainmentTree: AttainmentData,
  courseId: number,
  assessmentModel: AssessmentModelData,
  handleAddPoints: () => void,
  onChangeFormula: () => void
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const [editFormulaOpen, setEditFormulaOpen]: State<boolean> = useState(false);

  const rootFormula: UseQueryResult<FormulaData> = useGetFormula(
    props.attainmentTree.formula ?? Formula.Manual
  );

  const actionOptions: Array<MenuButtonOption> = [
    {
      description: 'Import from file',
      handleClick: props.handleAddPoints
    },
    {
      description: 'Import from A+',
      handleClick: () => console.error('Importing from A+ is not implemented')
    }
  ];

  return (
    <Box borderRadius={1} sx={{
      bgcolor: 'primary.light', p: 1.5, display: 'flex', flexDirection: 'column'
    }}>
      {
        (props.assessmentModel.id) &&
        <EditFormulaDialog
          handleClose={(): void => setEditFormulaOpen(false)}
          onSubmit={props.onChangeFormula}
          open={editFormulaOpen}
          courseId={props.courseId}
          assessmentModelId={props.assessmentModel.id}
          attainment={props.attainmentTree}
        />
      }
      <Typography variant='h3' align='left' sx={{ ml: 1.5, mt: 0.6, mb: 1.5 }} >
        Study Attainments
      </Typography>
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', pb: 1
      }}>
        <Typography align='left' sx={{ ml: 1.5 }} >
          {'Grading Formula: ' + rootFormula.data?.name}
        </Typography>
        <Button id='ag_edit_formula_btn' onClick={(): void => setEditFormulaOpen(true)}>
          Edit formula
        </Button>
        { /* The path above should be changes once courseId can be fetched from the path */}
      </Box>
      <Box sx={{ display: 'inline-grid', gap: 1 }}>
        {
          props.attainmentTree.subAttainments &&
          props.attainmentTree.subAttainments.map((attainment: AttainmentData) => {
            /* Since the attainments are displayed by the course view, they exist in the database
               and their actual ids can be used are keys of the attainment accoridon */
            return (
              <AttainmentCategory
                key={attainment.id}
                attainment={attainment}
                buttons={
                  [
                    <Button key='edit' onClick={(): void => {
                      navigate(
                        `/${props.courseId}/attainment/edit`
                        + `/${props.assessmentModel.id}/${attainment.id}`
                      );
                    }}>
                      Edit
                    </Button>
                  ]
                }
              />
            );
          })
        }
      </Box>
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', gap: 1, mt: 2, mb: 1
      }}>
        <Button onClick={(): void => {
          navigate(
            `/${props.courseId}/attainment/create`
            + `/${props.assessmentModel.id}/${props.attainmentTree.id}`
          );
        }}>
          Add attainment
        </Button>
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
          alignItems: 'center', gap: 1
        }}>
          <Button
            id='ag_course_results_btn'
            variant='outlined'
            onClick={(): void => {
              navigate(`/${props.courseId}/course-results/${props.assessmentModel.id}`);
            }}
          >
            See course results
          </Button>
          <MenuButton label='Import grades' options={actionOptions} />
        </Box>
      </Box>
    </Box>
  );
}

Attainments.propTypes = {
  attainmentTree: PropTypes.object,
  assessmentModel: PropTypes.object,
  courseId: PropTypes.number,
  handleAddPoints: PropTypes.func,
  onChangeFormula: PropTypes.func
};
