// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData,
  CourseData,
  Language,
  SystemRole,
  UserData,
} from 'aalto-grades-common/types';
import {Box, Button, Tooltip, Typography} from '@mui/material';
import {JSX} from 'react';

import AssessmentModelsList from './AssessmentModelsList';
import LightLabelBoldValue from '../typography/LightLabelBoldValue';

import {languageOptions} from '../course-results-view/SisuDownloadDialog';
import useAuth, {AuthContextType} from '../../hooks/useAuth';
import {LanguageOption} from '../../types';
import {convertToClientGradingScale} from '../../utils/textFormat';

export default function CourseDetails(props: {
  course: CourseData;
  assessmentModels?: Array<AssessmentModelData>;
  currentAssessmentModelId?: number;
  onChangeAssessmentModel: (assessmentModel: AssessmentModelData) => void;
  onNewAssessmentModel: () => void;
}): JSX.Element {
  const {auth, isTeacherInCharge}: AuthContextType = useAuth();

  function getLanguageById(id: Language): string {
    const languageOption: LanguageOption = languageOptions.find(
      (option: LanguageOption) => option.id === id
    ) as LanguageOption;
    return languageOption.language;
  }

  return (
    <Box sx={{display: 'inline-block'}}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          columnGap: 4,
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
            Course Details
          </Typography>
        </Box>
      </Box>
      <Box
        textAlign="left"
        borderRadius={1}
        sx={{
          bgcolor: 'secondary.light',
          p: 1.5,
          mt: 1,
          minWidth: '318px',
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
            minWidth: '318px',
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
      <Box sx={{mt: 1.5}}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h3" align="left" sx={{pt: 1.5, pb: 1}}>
            Assessment Models
          </Typography>
          {(auth?.role == SystemRole.Admin || isTeacherInCharge) && (
            <Tooltip title="New assessment model" placement="right">
              <Button onClick={props.onNewAssessmentModel}>New</Button>
            </Tooltip>
          )}
        </Box>
        <Box
          textAlign="left"
          borderRadius={1}
          sx={{
            bgcolor: 'secondary.light',
            p: 1.5,
            mt: 1,
            minWidth: '318px',
          }}
        >
          {props.assessmentModels &&
          props.assessmentModels.length > 0 &&
          props.currentAssessmentModelId ? (
            <AssessmentModelsList
              data={props.assessmentModels}
              current={props.currentAssessmentModelId}
              onClick={props.onChangeAssessmentModel}
            />
          ) : (
            <Box sx={{py: 2}}>
              No assessment models found. Please create a new assessment model.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
