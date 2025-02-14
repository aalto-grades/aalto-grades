// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {LocalizedString, SisuCourseInstance} from '@/common/types';

type PropsType = {
  open: boolean;
  onClose: () => void;
  courses: SisuCourseInstance[];
};

const SisuCourseDialog = ({open, onClose, courses}: PropsType): JSX.Element => {
  const {t, i18n} = useTranslation();
  const [id, setId] = useState<string>(
    courses[0].startDate + courses[0].endDate
  );
  const [activeCourse, setActiveCourse] = useState<SisuCourseInstance>(
    courses[0]
  );

  const [teachers, setTeachers] = useState<string[]>([]);

  // console.log(courses);

  const handleChange = (event: SelectChangeEvent): void => {
    setId(event.target.value);

    const course = courses.find(
      c => c.startDate + c.endDate === event.target.value
    );

    if (course) {
      setTeachers(course.teachers);
      setActiveCourse(course);
    } else {
      setTeachers(courses[0].teachers);
      setActiveCourse(courses[0]);
    }
  };

  const handleTeacherChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (event.target.checked) {
      setTeachers(prev => [...prev, event.target.name]);
    } else {
      setTeachers(prev =>
        prev.filter(teacher => teacher !== event.target.name)
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        Multiple Sisu instances found for <b>{courses[0].code}</b>
      </DialogTitle>
      <DialogContent>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="select-instance">Course instance</InputLabel>
              <Select
                labelId="select-instance"
                id="select-instance-id"
                value={id}
                label="id"
                onChange={handleChange}
              >
                {courses.map(course => (
                  <MenuItem
                    key={course.startDate + course.endDate}
                    value={course.startDate + course.endDate}
                  >
                    {course.name[i18n.language as keyof LocalizedString]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h5">Details:</Typography>
            <Typography>Teachers (select for export):</Typography>
            <FormControl sx={{ml: 2}} component="fieldset" variant="standard">
              <FormGroup>
                {activeCourse.teachers.map(teacher => (
                  <FormControlLabel
                    key={teacher}
                    control={
                      <Checkbox
                        checked={teachers.includes(teacher)}
                        onChange={handleTeacherChange}
                        name={teacher}
                      />
                    }
                    label={teacher}
                  />
                ))}
              </FormGroup>
            </FormControl>
            <Divider sx={{my: 1}} />
            <Typography>Course name, eng: {activeCourse.name.en}</Typography>
            <Typography>Course name, fin: {activeCourse.name.fi}</Typography>
            <Typography>Course name, sve: {activeCourse.name.sv}</Typography>
            <Divider sx={{my: 1}} />
            <Typography>
              Teaching language: {activeCourse.languageOfInstructionCodes[0]}
            </Typography>
            <Divider sx={{my: 1}} />
            <Typography>
              Grading scale {activeCourse.summary.gradingScale.en}
            </Typography>
            <Divider sx={{my: 1}} />
            <Typography>Start date: {activeCourse.startDate}</Typography>
            <Typography>End date: {activeCourse.endDate}</Typography>
            <Divider sx={{my: 1}} />
            <Typography>Minimum credits: {activeCourse.credits.min}</Typography>
            <Typography>Maximum credits: {activeCourse.credits.max}</Typography>
          </Box>
          <Divider />
          <Box>
            <DialogActions>
              <Button variant="outlined" onClick={onClose}>
                {t('general.cancel')}
              </Button>
              <Button variant="contained" type="submit">
                {t('general.select')}
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SisuCourseDialog;
