import {
  AccountTree,
  AccountTreeOutlined,
  FlagCircle,
  FlagCircleOutlined,
  Widgets,
  WidgetsOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {NavLink, useNavigate, useParams} from 'react-router-dom';

const SideMenu = ({onUpload}: {onUpload: () => void}) => {
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
        <Button variant="outlined" onClick={onUpload}>
          Upload Grades
        </Button>
        <Divider sx={{my: 2}} />
        <List>
          <ListItem disablePadding>
            <NavLink
              to={`/${courseId}/course-results`}
              style={{
                color: 'inherit',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              {({isActive, isPending: _, isTransitioning: __}) => {
                return (
                  <ListItemButton
                    sx={{
                      color: 'inherit',
                      width: '100%',
                      // padding: 1,
                      borderRadius: 100,
                      fontSize: '1rem',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                    }}
                    onClick={(): void => {
                      navigate(`/${courseId}/course-results`);
                    }}
                  >
                    <ListItemIcon>
                      {isActive ? <FlagCircle /> : <FlagCircleOutlined />}
                    </ListItemIcon>
                    <ListItemText primary="Grades" />
                  </ListItemButton>
                );
              }}
            </NavLink>
          </ListItem>

          <ListItem disablePadding>
            <NavLink
              to={`/${courseId}/models`}
              style={{
                color: 'inherit',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              {({isActive, isPending: _, isTransitioning: __}) => {
                return (
                  <ListItemButton
                    sx={{
                      color: 'inherit',
                      width: '100%',
                      // padding: 1,
                      borderRadius: 100,
                      fontSize: '1rem',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                    }}
                    onClick={(): void => {
                      navigate(`/${courseId}/models`);
                    }}
                  >
                    <ListItemIcon>
                      {isActive ? <AccountTree /> : <AccountTreeOutlined />}
                    </ListItemIcon>
                    <ListItemText primary="Models" />
                  </ListItemButton>
                );
              }}
            </NavLink>
          </ListItem>
          <ListItem disablePadding>
            <NavLink
              to={`/${courseId}/attainments`}
              style={{
                color: 'inherit',
                width: '100%',
                textDecoration: 'none',
              }}
            >
              {({isActive, isPending: _, isTransitioning: __}) => {
                return (
                  <ListItemButton
                    sx={{
                      color: 'inherit',
                      width: '100%',
                      // padding: 1,
                      borderRadius: 100,
                      fontSize: '1rem',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.1)' : '',
                    }}
                    onClick={(): void => {
                      navigate(`/${courseId}/attainments`);
                    }}
                  >
                    <ListItemIcon>
                      {isActive ? <Widgets /> : <WidgetsOutlined />}
                    </ListItemIcon>
                    <ListItemText primary="Attainments" />
                  </ListItemButton>
                );
              }}
            </NavLink>
          </ListItem>
        </List>
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
