// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Autocomplete, Box, TextField} from '@mui/material';
import {type JSX, useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {AplusCourseData} from '@/common/types';
import {useGetCourse} from '@/hooks/useApi';

type CourseOption = {label: string; courseCode: string};
const getCourseOption = (option: AplusCourseData): CourseOption => ({
  label: `${option.courseCode} - ${option.name}`,
  courseCode: option.courseCode,
});

type InstanceOption = {label: string; courseId: number};
const getInstanceOption = (option: AplusCourseData): InstanceOption => ({
  label: option.instance,
  courseId: option.id,
});

type PropsType = {
  aplusCourses: AplusCourseData[];
  selectedAplusCourse: AplusCourseData | null;
  setAplusCourse: (course: AplusCourseData | null) => void;
};
const SelectAplusCourse = ({
  aplusCourses,
  selectedAplusCourse,
  setAplusCourse,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const course = useGetCourse(courseId);

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    selectedAplusCourse ? getCourseOption(selectedAplusCourse) : null
  );
  const [selectedInstance, setSelectedInstance] =
    useState<InstanceOption | null>(
      selectedAplusCourse ? getInstanceOption(selectedAplusCourse) : null
    );

  const courseOptions = aplusCourses
    // Filter to only take first instance of each course
    .filter(
      (a, index) =>
        index === aplusCourses.findIndex(b => a.courseCode === b.courseCode)
    )
    .map(getCourseOption);

  const instanceOptions = aplusCourses
    .filter(
      aplusCourse => aplusCourse.courseCode === selectedCourse?.courseCode
    )
    .map(getInstanceOption);

  // Set instance
  const setInstance = useCallback(
    (aplusCourse: AplusCourseData | undefined): void => {
      if (!aplusCourse) return;
      setSelectedInstance(getInstanceOption(aplusCourse));
      setAplusCourse(aplusCourse);
    },
    [setAplusCourse]
  );

  // Set course & instance
  const setCourse = useCallback(
    (courseCode: string | undefined): void => {
      const aplusCourse = aplusCourses.find(ac => ac.courseCode === courseCode);
      if (!aplusCourse) return;

      setSelectedCourse(getCourseOption(aplusCourse));
      setInstance(aplusCourse);
    },
    [aplusCourses, setInstance]
  );

  if (!selectedAplusCourse) setCourse(course.data?.courseCode); // Try to set course if not selected yet

  if (!course.data) return <>{t('general.loading')}</>;

  return (
    <Box sx={{display: 'flex', mt: 1}}>
      <Autocomplete
        sx={{width: '60%'}}
        value={selectedCourse}
        onChange={(_, value) => setCourse(value?.courseCode)}
        options={courseOptions}
        renderInput={params => (
          <TextField {...params} label={t('general.course')} />
        )}
        isOptionEqualToValue={(option, value) =>
          option.courseCode === value.courseCode}
      />
      <Autocomplete
        sx={{width: '30%', ml: 1}}
        value={selectedInstance}
        onChange={(_, value) =>
          setInstance(
            aplusCourses.find(aplusCourse => aplusCourse.id === value?.courseId)
          )}
        disabled={!selectedCourse}
        options={instanceOptions}
        renderInput={params => (
          <TextField {...params} label={t('general.instance')} />
        )}
        isOptionEqualToValue={(option, value) =>
          option.courseId === value.courseId}
      />
    </Box>
  );
};

export default SelectAplusCourse;
