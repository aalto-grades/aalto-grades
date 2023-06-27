// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SyntheticEvent, useState } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextFieldBox from './TextFieldBox';
import { CourseData } from 'aalto-grades-common/types';
import { State } from '../../types';

interface FieldData {
  fieldId: string,
  fieldLabel: string,
  fieldHelperText: string
}

const codeData: FieldData = {
  fieldId: 'courseCode',
  fieldLabel: 'Course Code',
  fieldHelperText: 'Give the code that the new course is going to have.'
};

const nameData: FieldData = {
  fieldId: 'courseName',
  fieldLabel: 'Course Name',
  fieldHelperText: 'Give the name of the course the new course is going to have.'
};

const organizerData: FieldData = {
  fieldId: 'organizer',
  fieldLabel: 'Organizer',
  fieldHelperText: 'Give the organizer of the new course.'
};

/*const teachersData = {
  fieldId: 'teachers',
  fieldLabel: 'Teachers in Charge',
  fieldHelperText: 'Give the emails of the teachers in charge of the new course.'
};*/

function CreateCourseForm(params: {
  addCourse: (course: CourseData) => Promise<void>
}): JSX.Element {

  const [courseCode, setCode]: State<string> = useState('');
  const [name, setName]: State<string> = useState('');
  const [department, setOrganizer]: State<string> = useState('');
  //const [teacher, setTeacher]: State<string> = useState('');

  const id: number = -1;

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    try {
      // TODO remove mock data
      const courseObject: CourseData = ({
        id,
        courseCode,
        minCredits: 5,
        maxCredits: 5,
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
        },
        teachersInCharge: [
          {
            id: 23,
            name: 'Elon Musk'
          }
        ]
      });
      params.addCourse(courseObject);
    } catch (exception) {
      console.log(exception);
    }
  }

  return (
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
}

CreateCourseForm.propTypes = {
  addCourse: PropTypes.func
};

//<TextFieldBox fieldData={teachersData} setFunction={setTeacher}/>

export default CreateCourseForm;
