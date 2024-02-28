import {CourseData, SystemRole} from '@common/types';
import {
  Box,
  Typography,
  Tooltip,
  Button,
  Fade,
  CircularProgress,
  ButtonBase,
  Divider,
} from '@mui/material';
import React, {useState} from 'react';
import AssessmentModelsPicker from './AssessmentModelsPicker';
import Attainments from './Attainments';
import CourseDetails from './CourseDetails';
import InstancesWidget from './InstancesWidget';
import useAuth from '../../hooks/useAuth';
import {useGetAllAssessmentModels, useGetCourse} from '../../hooks/useApi';
import {useNavigate, useParams} from 'react-router-dom';
import {UseQueryResult} from '@tanstack/react-query';
import CreateAssessmentModelDialog from './CreateAssessmentModelDialog';

const SideMenu: React.FC = () => {
  const {auth, isTeacherInCharge, setIsTeacherInCharge} = useAuth();
  const {courseId} = useParams() as {courseId: string};
  const course = useGetCourse(courseId);
  const assessmentModels = useGetAllAssessmentModels(courseId);
  const navigate = useNavigate();

  const [createAssessmentModelOpen, setCreateAssessmentModelOpen] =
    useState(false);
  return (
    <>
      <Box
        style={{
          width: '200px',
          minWidth: '200px',
        }}
      >
        <Button variant="outlined">Upload Grades</Button>
        <Divider sx={{my: 2}} />
        <ButtonBase
          sx={{
            width: '100%',
            padding: 1,
            borderRadius: 100,
            fontSize: '1rem',
            textAlign: 'left',
          }}
          onClick={(): void => {
            navigate(`/${courseId}/course-results`);
          }}
        >
          Grades
        </ButtonBase>
        <ButtonBase
          sx={{
            width: '100%',
            padding: 1,
            borderRadius: 100,
            fontSize: '1rem',
          }}
          onClick={(): void => {
            navigate(`/${courseId}/models`);
          }}
        >
          Models
        </ButtonBase>
        <ButtonBase
          sx={{
            width: '100%',
            padding: 1,
            borderRadius: 100,
            fontSize: '1rem',
          }}
          onClick={(): void => {
            navigate(`/${courseId}/attainments`);
          }}
        >
          Attainments
        </ButtonBase>

        <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
          Assessment Model
          {(auth?.role === SystemRole.Admin || isTeacherInCharge) && (
            <Tooltip title="New assessment model" placement="right">
              <Button onClick={(): void => setCreateAssessmentModelOpen(true)}>
                New
              </Button>
            </Tooltip>
          )}
        </Typography>

        <div style={{display: 'flex', gap: 0}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
            {/* <AssessmentModelsPicker
                    course={course.data}
                    assessmentModels={assessmentModels.data}
                    currentAssessmentModelId={currentAssessmentModel?.id}
                    onChangeAssessmentModel={onChangeAssessmentModel}
                    onNewAssessmentModel={(): void =>
                      setCreateAssessmentModelOpen(true)
                    }
                  /> */}
            <div style={{marginRight: '20px', maxWidth: '300px'}}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {/* <CourseDetails
                        course={course.data}
                        assessmentModels={assessmentModels.data}
                        currentAssessmentModelId={currentAssessmentModel?.id}
                        onChangeAssessmentModel={onChangeAssessmentModel}
                        onNewAssessmentModel={(): void =>
                          setCreateAssessmentModelOpen(true)
                        }
                      /> */}
                {/* <InstancesWidget /> */}
              </Box>
            </div>
          </div>
        </div>
      </Box>
      <CreateAssessmentModelDialog
        open={createAssessmentModelOpen}
        handleClose={(): void => setCreateAssessmentModelOpen(false)}
        onSubmit={assessmentModels.refetch}
        assessmentModels={assessmentModels.data}
      />
    </>
  );
};

export default SideMenu;
