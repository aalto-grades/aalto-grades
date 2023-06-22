// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { id, name, courseCode, department } = course;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" align="left" sx={{ flexGrow: 1 }}>
          {courseCode + ' – ' + name.en}
        </Typography>
        <Typography variant="subtitle1" align="left">{department.en}</Typography>
      </CardContent>
      <Divider variant="middle"/>
      <CardActions>
        <Button id={`ag_see_instances_btn_${id}`} size="small" onClick={() => {
          navigate('/course-view/' + id);
        }}>
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

