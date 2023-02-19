// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';
import textFormatServices from '../../services/textFormat';
import sortingServices from '../../services/sorting';

const HoverBox = styled(Box)`
  &:hover,
  &:focus {
    background: #f4f4f4;
  }
`;

const InstanceBox = ({ instance }) => {
  let navigate = useNavigate();
  const { sisuCourseInstanceId, startDate, endDate, teachingMethod } = instance;

  return(
    <HoverBox 
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
      onClick={() => { navigate('/edit-instance/' + sisuCourseInstanceId); }}>
      <LightLabelBoldValue label='Type' value={textFormatServices.formatCourseType(teachingMethod)} />
      <Box sx={{ mx: 2 }}/>
      <LightLabelBoldValue label='Starting Date' value={textFormatServices.formatDateString(startDate)} />
      <LightLabelBoldValue label='Ending Date' value={textFormatServices.formatDateString(endDate)} />
    </HoverBox>
  );
};
  
InstanceBox.propTypes = {
  instance: PropTypes.object,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
};

const FetchedInstances = ({ info }) => {
  return(
    <Box>
      {info.sort((a, b) => sortingServices.sortByDate(a.startDate, b.startDate))
        .slice()
        .map((instance) => (
          <InstanceBox instance={instance} key={instance.sisuCourseInstanceId}/>
        ))}        
    </Box>
  );
};

FetchedInstances.propTypes = {
  info: PropTypes.array
};

export default FetchedInstances;
