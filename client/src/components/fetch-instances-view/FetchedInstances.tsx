// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NavigateFunction, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import textFormatServices from '../../services/textFormat';
import sortingServices from '../../services/sorting';
import { CourseInstanceData } from 'aalto-grades-common/types';

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
        value={textFormatServices.formatSisuCourseType(props.instance.type)}
      />
      <Box sx={{ mx: 2 }} />
      <LightLabelBoldValue
        label='Starting Date'
        value={textFormatServices.formatDateString(String(props.instance.startDate))}
      />
      <LightLabelBoldValue
        label='Ending Date'
        value={textFormatServices.formatDateString(String(props.instance.endDate))}
      />
    </HoverBox>
  );
}

InstanceBox.propTypes = {
  courseId: PropTypes.number,
  instance: PropTypes.object,
};

function FetchedInstances(props: {
  courseId: number,
  instances: Array<CourseInstanceData>
}): JSX.Element {
  return (
    <Box>
      {
        props.instances
          .sort(
            (a: CourseInstanceData, b: CourseInstanceData) => {
              return sortingServices.sortByDate(a.startDate, b.startDate);
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

export default FetchedInstances;
