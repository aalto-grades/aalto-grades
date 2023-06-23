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

const HoverBox = styled<any>(Box)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.hoverGrey2
  },
  '&:focus': {
    background: theme.palette.hoverGrey2
  }
}));

function InstanceBox({ courseId, instance }) {
  const navigate: NavigateFunction = useNavigate();
  const { sisuCourseInstanceId, startDate, endDate, type } = instance;

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
      onClick={() => {
        navigate('/' + courseId + '/edit-instance/' + sisuCourseInstanceId);
      }}>
      <LightLabelBoldValue label='Type' value={textFormatServices.formatCourseType(type)} />
      <Box sx={{ mx: 2 }} />
      <LightLabelBoldValue
        label='Starting Date'
        value={textFormatServices.formatDateString(startDate)}
      />
      <LightLabelBoldValue
        label='Ending Date'
        value={textFormatServices.formatDateString(endDate)}
      />
    </HoverBox>
  );
}

InstanceBox.propTypes = {
  // Once courseId is fixed to courseId from courseCode, change to number
  courseId: PropTypes.string,
  instance: PropTypes.object,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
};

function FetchedInstances({ courseId, info }) {
  return (
    <Box>
      {info.sort((a, b) => sortingServices.sortByDate(a.startDate, b.startDate))
        .slice()
        .map((instance) => (
          <InstanceBox courseId={courseId} instance={instance} key={instance.sisuCourseInstanceId}/>
        ))}
    </Box>
  );
}

FetchedInstances.propTypes = {
  // Once courseId is fixed to courseId from courseCode, change to number
  courseId: PropTypes.string,
  info: PropTypes.array
};

export default FetchedInstances;
