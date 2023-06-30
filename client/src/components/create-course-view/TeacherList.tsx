// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import Button from '@mui/material/Button';
import { State } from '../../types';
import TextField from '@mui/material/TextField';
import {
  Avatar, Box, IconButton, List,
  ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

/*
        <TeacherList
          setTeacherList={formik.handleChange}
          teacherList={formik.values.teachersInCharge}
        />


*/

function TeacherList(
  { setTeacherList, teacherList }: InferProps<typeof TeacherList.propTypes>
): JSX.Element {
  const theme: Theme = useTheme();
  const [teacher, setTeacher]: State<string> = useState('');
  const [error, setError]: State<string> = useState('');

  function addTeacher(): void {
    if (error.length === 0) {
      setTeacherList([...teacherList, teacher]);
      setTeacher('');
    }
  }

  function removeTeacher(value: string): void {
    setTeacherList(teacherList.filter((teacher: string) => teacher !== value));
  }

  function changeValue(value: string): void {
    setTeacher(value);
    if (teacherList.filter((teacherFromList: string) => teacherFromList === teacher).length !== 0) {
      setError('Email already on the list.');
    } else {
      setError('');
    }
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
        id='teachers'
        type='teachers'
        value={teacher}
        error={error.length !== 0}
        label='Teachers in Charge'
        variant='standard'
        color='primary'
        sx={{ my: 1, width: 330 }}
        InputLabelProps={{
          shrink: true,
          style: {
            fontSize: theme.typography.h2.fontSize
          }
        }}
        InputProps={{
          style: {
            margin: '32px 0px 0px 0px'
          }
        }}
        helperText={
          error.length === 0 ? 'Give the emails of the teachers in charge of the course.' : error
        }
        onChange={(
          { target }: { target: EventTarget & (HTMLInputElement | HTMLTextAreaElement) }
        ): void => changeValue(target.value)}>
      </TextField>
      <Button
        variant="outlined"
        startIcon={<PersonAddAlt1Icon />}
        disabled={teacher.length === 0 || error.length !== 0}
        onClick={(addTeacher)}
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
  );
}

TeacherList.propTypes = {
  setTeacherList: PropTypes.func,
  teacherList: Array<string>
};

export default TeacherList;
