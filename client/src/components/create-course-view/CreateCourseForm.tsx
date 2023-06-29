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

const teachersData: TextFieldData = {
  fieldId: 'teachers',
  fieldLabel: 'Teachers in Charge',
  fieldHelperText: 'Give the emails of the teachers in charge of the new course.'
};

function CreateCourseForm(params: {
  addCourse: (course: CourseData) => Promise<void>
}): JSX.Element {

  const [courseCode, setCode]: State<string | null> = useState(null);
  const [name, setName]: State<string | null> = useState(null);
  const [department, setOrganizer]: State<string | null> = useState(null);
  const [teacherList, setTeacherList]: State<Array<string>> = useState([]);
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
        <TeacherList
          fieldData={teachersData}
          setTeacherList={setTeacherList}
          teacherList={teacherList}
        />
        <Button
          id='ag_create_course_btn'
          size='medium'
          variant='contained'
          type='submit'
          disabled={!courseCode || !name || !department || teacherList.length === 0 }>
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

/*
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          boxShadow: 2,
          borderRadius: 2,
          my: 2,
          p: 2
        }}>
          <TextField
            id={teachersData.fieldId}
            type={teachersData.fieldId}
            label={teachersData.fieldLabel}
            variant='standard'
            color='primary'
            sx={{ my: 1 }}
            InputLabelProps={{
              shrink: true,
              style: {
                fontSize: theme.typography.h2.fontSize
              }
            }}
            value={teacher}
            InputProps={inputProps}
            helperText={teachersData.fieldHelperText}
            onChange={(
              { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
            ): void => setTeacher(target.value)}>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<PersonAddAlt1Icon />}
            onClick={addTeacher}
          >
            Add
          </Button>
          <Box sx={{ mt: 3, mb: 2 }}>
            {teacherList.length === 0 ?
              'Add at least one teacher in charge to the course'
              :
              <List dense={true}>
                {teacherList.map((teacherEmail: string) => {
                  return (
                    <ListItem
                      key={teacherEmail}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(): void => {
                            removeTeacher(teacherEmail);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={teacherEmail}
                      />
                    </ListItem>);
                })}
              </List>
            }
          </Box>
        </Box>

  const [courseCode, setCode]: State<string | null> = useState(null);
  const [name, setName]: State<string | null> = useState(null);
  const [department, setOrganizer]: State<string | null> = useState(null);
  const [teacher, setTeacher]: State<string> = useState('');

  const [teacherList, setTeacherList]: State<Array<string | null>> = useState(null);
            <ul>
              { teacherList.map((teacher: string) => {
                return (
                  <li key={teacher}>
                    {teacher}
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={(): void => {
                        removeTeacher(teacher);
                      }}
                    />
                  </li>);
              })}
            </ul>
*/
