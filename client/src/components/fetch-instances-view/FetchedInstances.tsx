// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { compareDate } from '../../services/sorting';
import { formatDateString, formatSisuCourseType } from '../../services/textFormat';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';

const HoverBox = styled(Box)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.hoverGrey2
  },
  '&:focus': {
    background: theme.palette.hoverGrey2
  }
}));

function InstanceBox(props: {
  courseId: number,
  instance: CourseInstanceData
}): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <HoverBox
      className='ag_fetched_instance_option'
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-around',
        boxShadow: 2,
        borderRadius: 2,
        my: 1,
        p: 3,
      }}
      onClick={(): void => {
        navigate('/' + props.courseId + '/edit-instance/' + props.instance.sisuCourseInstanceId);
      }}>
      <LightLabelBoldValue
        label='Type'
        value={formatSisuCourseType(props.instance.type)}
      />
      <Box sx={{ mx: 2 }} />
      <LightLabelBoldValue
        label='Starting Date'
        value={formatDateString(String(props.instance.startDate))}
      />
      <LightLabelBoldValue
        label='Ending Date'
        value={formatDateString(String(props.instance.endDate))}
      />
    </HoverBox>
  );
}

InstanceBox.propTypes = {
  courseId: PropTypes.number,
  instance: PropTypes.object,
};

export default function FetchedInstances(props: {
  courseId: number,
  instances: Array<CourseInstanceData>
}): JSX.Element {
  return (
    <Box>
      {
        props.instances
          .sort(
            (a: CourseInstanceData, b: CourseInstanceData) => {
              return compareDate(
                a.startDate as Date, b.startDate as Date
              );
            }
          )
          .slice()
          .map((instance: CourseInstanceData) => (
            <InstanceBox
              courseId={props.courseId}
              instance={instance}
              key={instance.sisuCourseInstanceId}
            />
          ))
      }
    </Box>
  );
}

FetchedInstances.propTypes = {
  courseId: PropTypes.number,
  instances: PropTypes.array
};
