// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import formulaServices from '../../services/formulas';
import { AttainmentData } from 'aalto-grades-common/types';

function SubAttainment(props: {
  attainment: AttainmentData,
  childParamsList: Array<string>,
  childParams: Map<string, object>,
  setChildParams: (childParams: Map<string, object>) => void
}): JSX.Element {

  function handleParamChange(
    event: ChangeEvent<HTMLInputElement>, param: string
  ): void {
    let params: object | undefined = props.childParams.get(props.attainment.tag);
    if (!params)
      params = {};

    (params as { [key: string]: unknown })[param] = event.target.value;

    props.childParams.set(props.attainment.tag, params);
    props.setChildParams(new Map(props.childParams));
  }

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2,
      borderRadius: 2,
      px: 3,
      pt: 1,
      pb: 1.5,
      width: 1,
      mx: 1.5,
      mb: 2
    }}>
      <Typography sx={{ fontWeight: 'bold', my: 1 }} align='left'>
        {props.attainment.name}
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridTemplateRows: 'auto',
        columnGap: 3,
        rowGap: 1,
        mt: 2,
      }}>
        {
          props.childParamsList.map((param: string) => {
            return (
              <TextField
                type='text'
                key={param}
                variant='standard'
                label={formulaServices.getParamLabel(param)}
                InputLabelProps={{ shrink: true }}
                margin='normal'
                sx={{
                  marginTop: 0,
                  width: '100%'
                }}
                onChange={
                  (event: ChangeEvent<HTMLInputElement>): void => {
                    handleParamChange(event, param);
                  }
                }
              />
            );
          })}
      </Box>
    </Box>
  );
}

SubAttainment.propTypes = {
  attainment: PropTypes.object,
  childParamsList: PropTypes.array,
  childParams: PropTypes.any,
  setChildParams: PropTypes.func
};

export default SubAttainment;
