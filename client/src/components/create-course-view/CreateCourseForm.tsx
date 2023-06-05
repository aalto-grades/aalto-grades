// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextFieldBox from './TextFieldBox';

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

/*const teachersData = {
  fieldId: 'teachers',
  fieldLabel: 'Responsibe Teachers',
  fieldHelperText: 'Give the emails of the responsible teachers of the new course.'
};*/

const CreateCourseForm = ({ addCourse }) => {

  const [courseCode, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setOrganizer] = useState('');
  //const [teacher, setTeacher] = useState(''); 

  const id = -1;

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const courseObject = ({
        id,
        courseCode,
        department: {
          fi: '',
          sv: '',
          en: department,
        },
        name: {
          fi: '',
          sv: '',
          en: name,
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: '',
        }
        // teacher
      });
      addCourse(courseObject);
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
        <Button id='ag_create_course_btn' size='medium' variant='contained' type='submit'>
          Create Course
        </Button>
      </form>
    </Container>
  );
};

CreateCourseForm.propTypes = {
  addCourse: PropTypes.func
};

//<TextFieldBox fieldData={teachersData} setFunction={setTeacher}/>

export default CreateCourseForm;
