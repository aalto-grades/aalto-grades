// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, FormulaData } from 'aalto-grades-common/types';
import PropTypes from 'prop-types';

import SubAttainment from './SubAttainment';

import StyledBox from '../edit-formula-dialog/StyledBox';

function SetFormulaParams(props: {
  attainment: AttainmentData,
  formula: FormulaData,
  params: object,
  setParams: (formulaParams: object) => void,
  childParams: Map<string, object>,
  setChildParams: (childParams: Map<string, object>) => void
}): JSX.Element {

  return (
    <>
      <StyledBox sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        bgcolor: 'primary.light',
        borderRadius: 1,
        pt: 2
      }}>
        {
          props.attainment.subAttainments?.map(
            (attainment: AttainmentData) => {
              return (
                <SubAttainment
                  key={attainment.tag}
                  attainment={attainment}
                  childParamsList={props.formula.childParams}
                  childParams={props.childParams}
                  setChildParams={props.setChildParams}
                />
              );
            }
          )
        }
      </StyledBox>
    </>
  );
}

SetFormulaParams.propTypes = {
  attainment: PropTypes.object,
  formula: PropTypes.object,
  params: PropTypes.object,
  setParams: PropTypes.func,
  childParams: PropTypes.any,
  setChildParams: PropTypes.func
};

export default SetFormulaParams;
