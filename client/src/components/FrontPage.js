import React from 'react';
import BasicGrid from './FrontPage/BasicGrid';
import { Typography } from '@mui/material';

const dummyData = [{name: 'Human-Computer Interaction', code: 'CS-C3120', department: 'Department of Computer Science'}, 
  {name: 'Software Engineering', code: 'CS-C3150 ', department: 'Department of Computer Science'}, 
  {name: 'Web Software Development', code: 'CS-C3170', department: 'Department of Computer Science'},
  {name: 'Basic Course in C Programming', code: 'ELEC-A7100', department: 'Department of Communications and Networking'},
  {name: 'Tieteen ja tiedon perusteet', code: 'TU-T9300', department: 'Department of Industrial Engineering and Management'}
];

const FrontPage = () => {
  return(
    <>
      <Typography variant="h3" component="div" align="left" sx={{ flexGrow: 1 }}>
                Your Current Courses
      </Typography>
      <BasicGrid data={dummyData}/>
      <Typography variant="h4" component="div" align="left" sx={{ flexGrow: 1 }}>
                Inactive Courses
      </Typography>
    </>
  );
};

export default FrontPage;