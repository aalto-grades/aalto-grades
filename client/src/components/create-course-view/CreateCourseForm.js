// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import TextFieldBox from './TextFieldBox';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

const codeData = {
  fieldId: 'courseCode',
  fieldLabel: 'Course Code',
  fieldHelperText: 'Give the code that the new course is going to have.'
};

const nameData = {
  fieldId: 'courseName',
  fieldLabel: 'Course Name',
  fieldHelperText: 'Give the name of the course the new course is going to have.'
};

const organizerData = {
  fieldId: 'organizer',
  fieldLabel: 'Organizer',
  fieldHelperText: 'Give the organizer of the new course.'
};

const teachersData = {
  fieldId: 'teachers',
  fieldLabel: 'Responsibe Teachers',
  fieldHelperText: 'Give the emails of the responsible teachers of the new course.'
};

const CreateCourseForm = () => {

  const [courseCode, setCode] = useState('');
  const [courseName, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [teacher, setTeacher] = useState(''); 

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const courseObject = ({
        courseCode,
        courseName,
        organizer,
        teacher
      });
      console.log(courseObject);
    } catch (exception) {
      console.log(exception);
    }
  };

  return(
    <Container maxWidth="sm" sx={{ textAlign: 'right' }}>
      <form onSubmit={handleSubmit}>
        <TextFieldBox fieldData={codeData} setFunction={setCode}/>
        <TextFieldBox fieldData={nameData} setFunction={setName}/>
        <TextFieldBox fieldData={organizerData} setFunction={setOrganizer}/>
        <TextFieldBox fieldData={teachersData} setFunction={setTeacher}/>
        <Button size='medium' variant='contained' type='submit'>
          Create Course
        </Button>
      </form>
    </Container>
  );
};

export default CreateCourseForm;
