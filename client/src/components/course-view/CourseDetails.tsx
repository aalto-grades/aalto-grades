// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import {JSX} from 'react';

import {
  AssessmentModelData,
  CourseData,
  Language,
  UserData,
} from '@common/types';
import {LanguageOption} from '../../types';
import {sisuLanguageOptions} from '../../utils';
import {convertToClientGradingScale} from '../../utils/textFormat';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';

export default function CourseDetails(props: {
  course: CourseData;
  assessmentModels?: Array<AssessmentModelData>;
  currentAssessmentModelId?: number;
  onChangeAssessmentModel: (assessmentModel: AssessmentModelData) => void;
  onNewAssessmentModel: () => void;
}): JSX.Element {
  function getLanguageById(id: Language): string {
    const languageOption = sisuLanguageOptions.find(
      option => option.id === id
    ) as LanguageOption;
    return languageOption.language;
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0}}>
      <Box sx={{mt: 1.5}}>
        <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
          Course Details
        </Typography>
        <Box
          textAlign="left"
          borderRadius={1}
          sx={{
            bgcolor: 'secondary.light',
            p: 1.5,
            mt: 1,
            // minWidth: '318px',
          }}
        >
          <LightLabelBoldValue
            label="Credits"
            value={
              props.course.minCredits === props.course.maxCredits
                ? props.course.minCredits
                : `${props.course.minCredits}-${props.course.maxCredits}`
            }
          />
          <LightLabelBoldValue
            label="Grading Scale"
            value={convertToClientGradingScale(props.course.gradingScale)}
          />
          <LightLabelBoldValue
            label="Organizing Department"
            value={props.course.department.en}
          />
          <LightLabelBoldValue
            label="Educational Institution"
            // REPLACE SOME DAY? currently this info can't be fetched from database
            value="Aalto University"
          />
          <LightLabelBoldValue
            label="Course language"
            value={getLanguageById(props.course.languageOfInstruction)}
          />
        </Box>
      </Box>
      <Box sx={{mt: 1.5}}>
        <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
          Teachers in Charge
        </Typography>
        <Box
          textAlign="left"
          borderRadius={1}
          sx={{
            bgcolor: 'secondary.light',
            p: 1.5,
            mt: 1,
            // minWidth: '318px',
          }}
        >
          {props.course.teachersInCharge.map((teacher: UserData) => {
            return (
              <Typography align="left" key={teacher.id}>
                {teacher.name}
              </Typography>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
