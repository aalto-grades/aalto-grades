// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {
  AssessmentModelData,
  CourseData,
  SystemRole,
} from 'aalto-grades-common/types';
import React, {useState} from 'react';
import {
  NavigateFunction,
  Params,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {AuthContextType} from '../../context/AuthProvider';
import {useGetAllAssessmentModels, useGetCourse} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {State} from '../../types';
import InstancesTable from './InstancesTable';

interface Props {
  // Define the props for your component here
}

const InstancesWidget: React.FC<Props> = props => {
  const navigate: NavigateFunction = useNavigate();
  const {courseId}: Params = useParams() as {courseId: string};
  const {auth, isTeacherInCharge}: AuthContextType = useAuth();
  const [
    createAssessmentModelOpen,
    setCreateAssessmentModelOpen,
  ]: State<boolean> = useState(false);
  const course: UseQueryResult<CourseData> = useGetCourse(courseId);
  const assessmentModels: UseQueryResult<Array<AssessmentModelData>> =
    useGetAllAssessmentModels(courseId);

  return (
    <div>
      <Box sx={{mt: 1.5}}>
        <div style={{display: 'flex'}}>
          <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
            Course Instances
          </Typography>
          {
            /* Only admins and teachers are allowed to create a new instance */
            (auth?.role == SystemRole.Admin || isTeacherInCharge) && (
              <Button
                id="ag_new_instance_btn"
                size="large"
                onClick={(): void => {
                  navigate(
                    `/${courseId}/fetch-instances/${course.data?.courseCode}`
                  );
                }}
              >
                Add instance
              </Button>
            )
          }
        </div>
        <Box
          textAlign="left"
          borderRadius={1}
          sx={{
            bgcolor: 'secondary.light',
            p: 1.5,
            mt: 1,
            // minWidth: '318px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <InstancesTable courseId={courseId} />
        </Box>
      </Box>
    </div>
  );
};

export default InstancesWidget;
