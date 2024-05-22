// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
} from '@mui/material';
import {useState} from 'react';

import {AplusCourseData} from '@/common/types';
import {
  useFetchAplusCourses,
  useFetchAplusExerciseData,
} from '../../hooks/useApi';

type AplusModule = {
  id: number;
  name: string;
};

type SelectAplusGradeSourcesProps = {
  aplusCourse: AplusCourseData;
  handleFullPointsChange: (checked: boolean) => void;
  handleModuleChange: (module: AplusModule, checked: boolean) => void;
  handleDifficultyChange: (difficulty: string, checked: boolean) => void;
};

const SelectAplusGradeSources = ({
  aplusCourse,
  handleFullPointsChange,
  handleModuleChange,
  handleDifficultyChange,
}: SelectAplusGradeSourcesProps): JSX.Element => {
  const aplusExerciseData = useFetchAplusExerciseData(aplusCourse.id);

  return (
    <>
      {aplusExerciseData.data && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                onChange={event => handleFullPointsChange(event.target.checked)}
              />
            }
            label="Full points"
          />
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
                        onChange={event =>
                          handleModuleChange(module, event.target.checked)
                        }
                      />
                    }
                    label={module.name}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
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
                        onChange={event =>
                          handleDifficultyChange(
                            difficulty,
                            event.target.checked
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
        </>
      )}
    </>
  );
};

type AttainmentCardProps = {
  name: string;
};

const AttainmentCard = ({
  name,
}: AttainmentCardProps): JSX.Element => {
  return (
    <Card>
      <CardContent>
        <TextField
          sx={{mt: 1}}
          label="Name"
          value={name}
        />
        <TextField
          sx={{mt: 1}}
          label="Days valid"
          type="number"
          value={365}
        />
      </CardContent>
    </Card>
  );
};

type CreateAplusAttainmentsProps = {
  aplusCourseId: number;
  createFullPoints: boolean;
  createModules: AplusModule[];
  createDifficulties: string[];
};

const CreateAplusAttainments = ({
  aplusCourseId,
  createFullPoints,
  createModules,
  createDifficulties,
}: CreateAplusAttainmentsProps): JSX.Element => {
  return (
    <>
      {createFullPoints && (
        <AttainmentCard
          name="A+ Course"
        />
      )}
      {createModules.map(module =>
        <AttainmentCard
          name={module.name}
        />
      )}
      {createDifficulties.map(difficulty =>
        <AttainmentCard
          name={`A+ Difficulty ${difficulty}`}
        />
      )}
    </>
  );
};

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const AplusDialog = ({handleClose, open}: PropsType): JSX.Element => {
  const aplusCourses = useFetchAplusCourses();

  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [createFullPoints, setCreateFullPoints] = useState<boolean>(false);
  const [createModules, setCreateModules] = useState<AplusModule[]>([]);
  const [createDifficulties, setCreateDifficulties] = useState<string[]>([]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ Courses</DialogTitle>
      <DialogContent>
        {step === 0 &&
          aplusCourses.data &&
          aplusCourses.data.map(course => (
            <Button
              onClick={() => {
                setAplusCourse(course);
                setStep(1);
              }}
            >
              {course.name}
            </Button>
          ))}
        {step === 1 && aplusCourse && (
          <SelectAplusGradeSources
            aplusCourse={aplusCourse}
            handleFullPointsChange={checked => setCreateFullPoints(checked)}
            handleModuleChange={(module, checked) => {
              if (checked) {
                setCreateModules([...createModules, module]);
              } else {
                setCreateModules(createModules.filter(m => m !== module));
              }
            }}
            handleDifficultyChange={(difficulty, checked) => {
              if (checked) {
                setCreateDifficulties([...createDifficulties, difficulty]);
              } else {
                setCreateDifficulties(
                  createDifficulties.filter(d => d !== difficulty)
                );
              }
            }}
          />
        )}
        {step === 2 && aplusCourse && (
          <CreateAplusAttainments
            aplusCourseId={aplusCourse.id}
            createFullPoints={createFullPoints}
            createModules={createModules}
            createDifficulties={createDifficulties}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={step === 0}
          onClick={() => setStep(2)}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AplusDialog;
