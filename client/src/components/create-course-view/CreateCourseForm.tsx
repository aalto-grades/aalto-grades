// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SyntheticEvent, useState } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import TextFieldBox, { TextFieldData } from './TextFieldBox';
import { CourseData } from 'aalto-grades-common/types';
import { State } from '../../types';
import TeacherList from './TeacherList';
import CreditsBox from './CreditsBox';
import { NewCourseData } from './Form';

const codeData: TextFieldData = {
  fieldId: 'courseCode',
  fieldLabel: 'Course Code',
  fieldHelperText: 'Give the code that the new course is going to have.'
};

const nameData: TextFieldData = {
  fieldId: 'courseName',
  fieldLabel: 'Course Name',
  fieldHelperText: 'Give the name of the course the new course is going to have.'
};

const organizerData: TextFieldData = {
  fieldId: 'organizer',
  fieldLabel: 'Organizer',
  fieldHelperText: 'Give the organizer of the new course.'
};

function CreateCourseForm(params: {
  addCourse: (course: NewCourseData) => Promise<void>
}): JSX.Element {

  const [courseCode, setCode]: State<string | null> = useState(null);
  const [name, setName]: State<string | null> = useState(null);
  const [department, setOrganizer]: State<string | null> = useState(null);
  const [teacherList, setTeacherList]: State<Array<string>> = useState([]);
  const [minCredits, setMinCredits]: State<number | null> = useState(null);
  const [maxCredits, setMaxCredits]: State<number | null> = useState(null);
  const id: number = -1;

  /*
    courseCode: yup.string().required(),
    minCredits: yup.number().min(0).required(),
    maxCredits: yup.number().min(yup.ref('minCredits')).required(),
    teachersInCharge: yup.array().of(
      yup.object().shape({
        id: yup.number().required()
      })
    ).required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required()
  });
  */

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();
    try {
      const courseObject: NewCourseData = ({
        courseCode,
        minCredits,
        maxCredits,
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
        teachersInCharge: teacherList
      });
      // ????
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
        <CreditsBox
          setMaxCredits={setMaxCredits} setMinCredits={setMinCredits}
          maxCredits={maxCredits} minCredits={minCredits}
        />
        <TeacherList setTeacherList={setTeacherList} teacherList={teacherList}/>
        <Button
          id='ag_create_course_btn'
          size='medium'
          variant='contained'
          type='submit'
          disabled={
            !courseCode ||
            !name || !department ||
            !minCredits || !minCredits ||
            minCredits > maxCredits ||
            teacherList.length === 0
          }>
          Create Course
        </Button>
      </form>
    </Container>
  );
}

CreateCourseForm.propTypes = {
  addCourse: PropTypes.func
};

export default CreateCourseForm;
