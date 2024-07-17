// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Autocomplete, Box, MenuItem, Select, TextField} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {AplusCourseData} from '@/common/types';
import {useGetCourse} from '../../hooks/useApi';

type PropsType = {
  aplusCourses: AplusCourseData[];
  setAplusCourse: (course: AplusCourseData | null) => void;
};

const SelectAplusCourse = ({
  aplusCourses,
  setAplusCourse,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const course = useGetCourse(courseId);

  // Course code
  const [selected, setSelected] = useState<string | null>(null);

  const courseOptions = aplusCourses
    .filter(
      (a, index) =>
        index === aplusCourses.findIndex(b => a.courseCode === b.courseCode)
    )
    .map(option => ({
      label: `${option.courseCode} - ${option.name}`,
      courseCode: option.courseCode,
    }));

  if (!course.data) return <></>;

  // TODO: Default instance should be chosen as the latest instance
  return (
    <Box sx={{display: 'flex', mt: 1}}>
      <Autocomplete
        sx={{width: 400}}
        onChange={(_, value) =>
          setSelected(value !== null ? value.courseCode : null)
        }
        options={courseOptions}
        renderInput={params => <TextField {...params} label="Course" />}
        defaultValue={courseOptions.find(
          option => option.courseCode === course.data.courseCode
        )}
      />
      {/* TODO: Label */}
      <Select
        disabled={!selected}
        sx={{width: 150, ml: 1}}
        onChange={e =>
          setAplusCourse(
            aplusCourses.find(course => course.id === e.target.value) ?? null
          )
        }
      >
        {aplusCourses
          .filter(course => course.courseCode === selected)
          .map(course => (
            <MenuItem value={course.id}>{course.instance}</MenuItem>
          ))}
      </Select>
    </Box>
  );
};

export default SelectAplusCourse;
