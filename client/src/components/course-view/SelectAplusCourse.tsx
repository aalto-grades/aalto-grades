// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Autocomplete, Box, MenuItem, Select, TextField} from '@mui/material';
import {JSX, useState} from 'react';

import {AplusCourseData} from '@/common/types';

type PropsType = {
  aplusCourses: AplusCourseData[];
  setAplusCourse: (course: AplusCourseData | null) => void;
};

const SelectAplusCourse = ({
  aplusCourses,
  setAplusCourse,
}: PropsType): JSX.Element => {
  // Course code
  const [selected, setSelected] = useState<string | null>(null);

  // TODO: Default course should be chosen based on the course code and the
  // default instance should be chosen as the latest instance
  return (
    <Box sx={{display: 'flex', mt: 1}}>
      <Autocomplete
        sx={{width: 400}}
        onChange={(_, value) =>
          setSelected(value !== null ? value.courseCode : null)
        }
        options={aplusCourses
          .filter(
            (a, index) =>
              index ===
              aplusCourses.findIndex(b => a.courseCode === b.courseCode)
          )
          .map(course => ({
            label: `${course.courseCode} - ${course.name}`,
            courseCode: course.courseCode,
          }))}
        renderInput={params => <TextField {...params} label="Course" />}
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
