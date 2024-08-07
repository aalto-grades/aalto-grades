// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Autocomplete, Box, TextField} from '@mui/material';
import {JSX, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {AplusCourseData} from '@/common/types';
import {useGetCourse} from '../../../hooks/useApi';

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

  // Course code
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    selectedAplusCourse?.courseCode ?? null
  );

  // Instance name, used to set the default selected instance
  const [selectedInstance, setSelectedInstance] = useState<string | null>(
    selectedAplusCourse?.instance ?? null
  );

  const setInstance = (aplusCourse: AplusCourseData | undefined): void => {
    setSelectedInstance(aplusCourse?.instance ?? null);
    setAplusCourse(aplusCourse ?? null);
  };

  const setCourse = (aplusCourse: AplusCourseData | undefined): void => {
    setSelectedCourse(aplusCourse?.courseCode ?? null);
    setInstance(aplusCourse);
  };

  const courseOptions = aplusCourses
    .filter(
      (a, index) =>
        index === aplusCourses.findIndex(b => a.courseCode === b.courseCode)
    )
    .map(option => ({
      label: `${option.courseCode} - ${option.name}`,
      courseCode: option.courseCode,
    }));

  const defaultCourse = courseOptions.find(
    option =>
      option.courseCode ===
      (selectedAplusCourse?.courseCode ?? course.data?.courseCode)
  );

  const instanceOptions = aplusCourses
    .filter(aplusCourse => aplusCourse.courseCode === selectedCourse)
    .map(option => ({
      label: option.instance,
      courseId: option.id,
    }));

  useEffect(() => {
    if (!selectedAplusCourse) {
      setCourse(
        aplusCourses.find(
          aplusCourse => aplusCourse.courseCode === defaultCourse?.courseCode
        )
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!course.data) return <></>;

  return (
    <Box sx={{display: 'flex', mt: 1}}>
      <Autocomplete
        sx={{width: 400}}
        onChange={(_, value) => {
          setCourse(
            aplusCourses.find(
              aplusCourse => aplusCourse.courseCode === value?.courseCode
            )
          );
        }}
        options={courseOptions}
        renderInput={params => (
          <TextField {...params} label={t('general.course.singular')} />
        )}
        defaultValue={defaultCourse}
      />
      <Autocomplete
        disabled={!selectedCourse}
        sx={{width: 200, ml: 1}}
        onChange={(_, value) =>
          setInstance(
            aplusCourses.find(aplusCourse => aplusCourse.id === value?.courseId)
          )
        }
        options={instanceOptions}
        renderInput={params => (
          <TextField {...params} label={t('general.instance')} />
        )}
        value={
          // We must return null instead of undefined, otherwise this
          // Autocomplete is considered uncontrolled and our logic breaks
          instanceOptions.find(option => option.label === selectedInstance) ??
          null
        }
      />
    </Box>
  );
};

export default SelectAplusCourse;
