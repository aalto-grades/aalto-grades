// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {
  ExtServiceCourseData,
  ExtServiceExerciseData,
} from '@/common/types';
import {useFetchExtServiceExerciseData} from '@/hooks/useApi';

type SelectableSource = ExtServiceExerciseData[number]['items'][number];

type PropsType = {
  serviceInfo: {id: string; label: string; tokenLink: string};
  aplusCourse: ExtServiceCourseData;
  selectedGradeSources: Array<{id: string | number}>;
  handleSelect: (source: SelectableSource) => void;
};
const SelectServiceGradeSource = ({
  serviceInfo,
  aplusCourse: extServiceCourse,
  selectedGradeSources,
  handleSelect,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const serviceExerciseData = useFetchExtServiceExerciseData(
    serviceInfo,
    extServiceCourse.id,
  );

  const isDisabled = (newSource: SelectableSource): boolean => {
    return (selectedGradeSources ?? []).some(gradeSource => newSource.id === gradeSource.id);
  };

  if (serviceExerciseData.data === undefined) return <>{t('general.loading')}</>;

  let extServiceItems: ExtServiceExerciseData = [];

  if (serviceInfo.id === 'a+') {
    // Aplus specific logic if implemented
  } else {
    extServiceItems = serviceExerciseData.data;
  }

  return (
    <>
      {extServiceItems.map((category, index) => (
        <Accordion key={index} defaultExpanded={(index === 0)}>
          <AccordionSummary expandIcon={<ArrowDropDown />}>
            {category.name}
          </AccordionSummary>
          <AccordionDetails>
            {category.items.map(item => (
              <Button
                key={item.id}
                fullWidth
                disabled={isDisabled(item)}
                onClick={() => handleSelect(item)}
                sx={{justifyContent: 'flex-start'}}
              >
                {item.itemname}
              </Button>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export default SelectServiceGradeSource;
