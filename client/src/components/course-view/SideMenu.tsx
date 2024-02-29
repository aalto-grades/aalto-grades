import {Box, Button, ButtonBase, Divider} from '@mui/material';
import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';

const SideMenu: React.FC = () => {
  const {courseId} = useParams() as {courseId: string};
  const navigate = useNavigate();

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
    </>
  );
};

export default SideMenu;
