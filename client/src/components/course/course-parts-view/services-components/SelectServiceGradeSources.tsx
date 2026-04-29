// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import {
  type ExtServiceCourseData,
  type ExtServiceExerciseData,
  ExtServiceGradeSourceType,
  type NewExtServiceGradeSourceData,
  // type NewExtServiceGradeSourceData,
} from '@/common/types';
import {useFetchExtServiceExerciseData} from '@/hooks/useApi';

type SelectableSource = ExtServiceExerciseData[number]['items'][number];

type PropsType = {
  serviceInfo: {id: string; label: string; tokenLink: string};
  aplusCourse: ExtServiceCourseData;
  selectedGradeSources: NewExtServiceGradeSourceData[];
  handleChange: (
    checked: boolean,
    name: string,
    maxGrade: number,
    source: SelectableSource,
    // source: ExtServiceExerciseData[0]['items'][number],
  ) => void;
};
const SelectAplusGradeSources = ({
  serviceInfo,
  aplusCourse: extServiceCourse,
  selectedGradeSources,
  handleChange,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const serviceExerciseData = useFetchExtServiceExerciseData(
    serviceInfo,
    extServiceCourse.id,
  );

  let extServiceItems: ExtServiceExerciseData = [];

  // const isChecked = (newSource: NewAplusGradeSourceData): boolean =>
  //   selectedGradeSources.some((source) => {
  //     console.log('Comparing sources:', newSource, source);
  //     return newSource.id === source.id;
  //     // aplusGradeSourcesEqual(newSource, source)
  //   }
  //   );
  const isChecked = (newSource: SelectableSource): boolean =>
    selectedGradeSources.some(source => newSource.id === source.id);

  if (serviceExerciseData.data === undefined)
    return <>{t('general.loading')}</>;

  if (serviceInfo.id === 'a+') {
    // const fullPoints = newAplusGradeSource(
    //   aplusCourse,
    //   getLatestAplusModuleDate(serviceExerciseData.data),
    //   {}
    // );
    // const modules: [AplusModule, NewAplusGradeSourceData][] =
    //   serviceExerciseData.data.modules.map(module => [
    //     module,
    //     newAplusGradeSource(aplusCourse, module.closingDate, {module}),
    //   ]);
    // const exercises: [AplusExercise, NewAplusGradeSourceData][] = [];
    // for (const module of serviceExerciseData.data.modules) {
    //   for (const exercise of module.exercises) {
    //     exercises.push([
    //       exercise,
    //       newAplusGradeSource(aplusCourse, module.closingDate, {exercise}),
    //     ]);
    //   }
    // }
    // const difficulties: [AplusDifficulty, NewAplusGradeSourceData][] =
    //   serviceExerciseData.data.difficulties.map(difficulty => [
    //     difficulty,
    //     newAplusGradeSource(
    //       aplusCourse,
    //       getLatestAplusModuleDate(serviceExerciseData.data),
    //       {difficulty}
    //     ),
    //   ]);
  } else {
    extServiceItems = serviceExerciseData.data;
  }

  return (
    <>
      {extServiceItems.map((category, index) => {
        // <Accordion key={index}>
        //   <AccordionSummary expandIcon={<ArrowDropDown />}>
        //     {t(`general.${category.name}`)}
        //   </AccordionSummary>
        //   <AccordionDetails>
        //     <FormGroup>
        //       {category.items.map(item => (
        //         <FormControlLabel
        //           key={item.id}
        //           label={item.itemname}
        //           control={(
        //             <Checkbox
        //               checked={isChecked(item.source)}
        //               onChange={e =>
        //                 handleChange(
        //                   e.target.checked,
        //                   `[${aplusCourse.name}] ${t('general.' + category.type)}: ${
        //                     item.name
        //                   }`,
        //                   item.maxGrade,
        //                   item.source
        //                 )}
        //             />
        //           )}
        //         />
        //       ))}
        //     </FormGroup>
        //   </AccordionDetails>
        // </Accordion>;
        return (
          <Accordion key={index} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ArrowDropDown />}>
              {category.name}
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {category.items.map(item => (
                  <FormControlLabel
                    key={item.id}
                    label={item.itemname}
                    control={(
                      <Checkbox
                        checked={isChecked(item)}
                        onChange={e =>
                          handleChange(
                            e.target.checked,
                            `[${extServiceCourse.name}] ${
                              category.id
                              === ExtServiceGradeSourceType.FullPoints
                                ? ''
                                : t(`general.${category.id.toLowerCase().replace('_', '-')}`) + ': '
                            }${item.itemname}`,
                            item?.maxGrade ?? 100,
                            item,
                          )}
                      />
                    )}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

export default SelectAplusGradeSources;
