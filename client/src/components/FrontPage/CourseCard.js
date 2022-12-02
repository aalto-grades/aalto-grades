import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';

// add spacing before action part
const CourseCard = ({course}) => {
  let navigate = useNavigate();
  const { name, courseCode, department } = course;

  return(
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" align="left" sx={{ flexGrow: 1 }}>
          {courseCode + ' – ' + name.en}
        </Typography>
        <Typography variant="subtitle1" align="left">{department.en}</Typography>
      </CardContent>
      <Divider variant="middle"/>
      <CardActions>
        <Button size="small" onClick={() => { navigate('/course-view/' + courseCode); }}>
                    See instances
        </Button>
      </CardActions>
    </Card>
  );
};

CourseCard.propTypes = {
  course: PropTypes.object,
  name: PropTypes.string,
  code: PropTypes.string,
  department: PropTypes.string
};
  
export default CourseCard;

