// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseInstanceData} from '@common/types';
import {Box, Tooltip} from '@mui/material';
import {JSX} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';

import LightLabelBoldValue from '../typography/LightLabelBoldValue';

import {compareDate} from '../../utils/sorting';
import {formatDateString, formatSisuCourseType} from '../../utils/textFormat';

function InstanceBox(props: {
  courseId: number;
  instance: CourseInstanceData;
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <Tooltip
      title={
        props.instance.sisuInstanceInUse
          ? 'This Sisu instance is already in use and cannot be selected'
          : ''
      }
      placement="top"
    >
      <Box
        className="ag_fetched_instance_option"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          boxShadow: 2,
          borderRadius: 2,
          my: 1,
          p: 3,
          backgroundColor: props.instance.sisuInstanceInUse
            ? '#cfcfcf'
            : 'white',
          '&:hover': {
            backgroundColor: props.instance.sisuInstanceInUse
              ? '#cfcfcf'
              : 'primary.light',
          },
        }}
        onClick={(): void => {
          if (!props.instance.sisuInstanceInUse) {
            navigate(
              `/${props.courseId}/edit-instance/${props.instance.sisuCourseInstanceId}`
            );
          }
        }}
      >
        <LightLabelBoldValue
          label="Sisu ID"
          value={props.instance.sisuCourseInstanceId as string}
        />
        <LightLabelBoldValue
          label="Type"
          value={formatSisuCourseType(props.instance.type)}
        />
        <LightLabelBoldValue
          label="Status"
          value={props.instance.sisuInstanceInUse ? 'In use' : 'Available'}
        />
        <LightLabelBoldValue
          label="Starting Date"
          value={formatDateString(String(props.instance.startDate))}
        />
        <LightLabelBoldValue
          label="Ending Date"
          value={formatDateString(String(props.instance.endDate))}
        />
      </Box>
    </Tooltip>
  );
}

export default function FetchedInstances(props: {
  courseId: number;
  instances: Array<CourseInstanceData>;
}): JSX.Element {
  return (
    <Box>
      {props.instances
        .sort((a: CourseInstanceData, b: CourseInstanceData) => {
          return compareDate(a.startDate as Date, b.startDate as Date);
        })
        .slice()
        .map((instance: CourseInstanceData) => (
          <InstanceBox
            courseId={props.courseId}
            instance={instance}
            key={instance.sisuCourseInstanceId}
          />
        ))}
    </Box>
  );
}
