// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { TextFieldData } from './TextFieldBox';
import { State } from '../../types';
import TextField from '@mui/material/TextField';
import {
  Avatar, Box, IconButton, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

const inputProps = {
  style: {
    margin: '32px 0px 0px 0px'
  }
};

function TeacherList(params: {
  fieldData: TextFieldData,
  setTeacherList: (value: Array<string>) => void,
  teacherList: Array<string>
}): JSX.Element {
  const theme: Theme = useTheme();
  const [teacher, setTeacher]: State<string> = useState('');

  function addTeacher(): void {
    if (
      teacher.length !== 0 &&
      params.teacherList.filter(
        (teacherFromList: string) => teacherFromList === teacher).length === 0
    ) {
      params.setTeacherList([...params.teacherList, teacher]);
      setTeacher('');
    } else {
      console.log('already on list or empty string');
    }
  }

  function removeTeacher(remove: string): void {
    params.setTeacherList(params.teacherList.filter((teacher: string) => teacher !== remove));
  }

  return (
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
        id={params.fieldData.fieldId}
        type={params.fieldData.fieldId}
        label={params.fieldData.fieldLabel}
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
        helperText={params.fieldData.fieldHelperText}
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
        {params.teacherList.length === 0 ?
          'Add at least one teacher in charge to the course'
          :
          <List dense={true}>
            {params.teacherList.map((teacherEmail: string) => {
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
  );
}

TeacherList.propTypes = {
  fieldData: PropTypes.object,
  fieldId: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldHelperText: PropTypes.string,
  setFunction: PropTypes.func,
};

export default TeacherList;


/*

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
