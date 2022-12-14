import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import textFormatServices from '../../services/textFormat';

const LightLabelboldValue = ({ label, value }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', columnGap: 1 }}>
      <Typography variant='body2'>{label + ':'}</Typography>
      <Typography variant='body2' sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  );
};

LightLabelboldValue.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
};

const OngoingInstanceInfo = ({ info }) => {
  const { period, startDate, endDate, type, credits, scale, organizer, institution } = info;

  return(
    <Box sx={{ display: 'inline-block', pt: 1.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 4, pb: 1 }}>
        <Typography variant='h6' align='left' sx={{ ml: 1.5 }} >Ongoing instance</Typography>
        <Button>See attendees</Button>
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, minWidth: '190px' }}>
        <LightLabelboldValue label='Teaching Period' value={period} />
        <LightLabelboldValue label='Starting Date' value={textFormatServices.formatDate(startDate)} />
        <LightLabelboldValue label='Ending Date' value={textFormatServices.formatDate(endDate)} />
        <LightLabelboldValue label='Type' value={type} />
      </Box>
      <Box textAlign='left' borderRadius={1} sx={{ bgcolor: 'secondary.light', p: 1.5, mt: 1, minWidth: '190px' }}>
        <LightLabelboldValue label='Credits' value={credits} />
        <LightLabelboldValue label='Grading Scale' value={scale} />
        <LightLabelboldValue label='Organizer' value={organizer} />
        <LightLabelboldValue label='Educational Institution' value={institution} />
      </Box>
      <Box sx={{ m: 1.5 }}>
        <Typography variant='h6' align='left' sx={{ pt: 1.5, pb: 1 }}>Responsible Teachers</Typography>
        <Typography align='left'>Elisa Mekler (you)</Typography>
        <Typography align='left'>David McGookin</Typography>
      </Box>
    </Box>
  );
};

OngoingInstanceInfo.propTypes = {
  info: PropTypes.object,
  period: PropTypes.string,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  type: PropTypes.string,
  credits: PropTypes.number,
  scale: PropTypes.string,
  organizer: PropTypes.string,
  institution: PropTypes.string
};

export default OngoingInstanceInfo;