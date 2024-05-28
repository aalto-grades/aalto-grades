// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';

import {
  AplusCourseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import {useFetchAplusExerciseData} from '../../hooks/useApi';

type PropsType = {
  aplusCourse: AplusCourseData;
  handleChange: (
    checked: boolean,
    name: string,
    source: AplusGradeSourceData
  ) => void;
};

const SelectAplusGradeSources = ({
  aplusCourse,
  handleChange,
}: PropsType): JSX.Element => {
  const aplusExerciseData = useFetchAplusExerciseData(aplusCourse.id);

  return (
    <>
      {aplusExerciseData.data && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ArrowDropDown />}>
              Course
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={e =>
                      handleChange(e.target.checked, 'A+ Course', {
                        attainmentId: -1,
                        aplusCourseId: aplusCourse.id,
                        sourceType: AplusGradeSourceType.FullPoints,
                      })
                    }
                  />
                }
                label="Full points"
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDown />}>
              Modules
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {aplusExerciseData.data.modules.map(module => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={e =>
                          handleChange(
                            e.target.checked,
                            `A+ Module: ${module.name}`,
                            {
                              attainmentId: -1,
                              aplusCourseId: aplusCourse.id,
                              sourceType: AplusGradeSourceType.Module,
                              moduleId: module.id,
                            }
                          )
                        }
                      />
                    }
                    label={module.name}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          {aplusExerciseData.data.difficulties.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ArrowDropDown />}>
                Difficulties
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {aplusExerciseData.data.difficulties.map(difficulty => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={e =>
                            handleChange(
                              e.target.checked,
                              `A+ Difficulty: ${difficulty}`,
                              {
                                attainmentId: -1,
                                aplusCourseId: aplusCourse.id,
                                sourceType: AplusGradeSourceType.Difficulty,
                                difficulty: difficulty,
                              }
                            )
                          }
                        />
                      }
                      label={difficulty}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </>
  );
};

export default SelectAplusGradeSources;
