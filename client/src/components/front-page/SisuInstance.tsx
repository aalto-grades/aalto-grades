// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Typography,
  styled,
} from '@mui/material';
import {Fragment, type JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {
  Language,
  LocalizedString,
  SisuCourseInstance,
} from '@/common/types';
import {sisuLanguageOptions} from '@/utils';

const StyledCard = styled(Card)(({theme}) => ({
  padding: 5,
  height: '100%',
  minHeight: '170px',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: `0 4px 8px ${
      theme.palette.mode === 'dark'
        ? 'rgba(137, 130, 130, 0.2)'
        : 'rgba(0,0,0,0.2)'
    }`,
  },
}));

type PropsType = {
  course: SisuCourseInstance;
  selectCourse: () => void;
};

const SisuInstance = ({course, selectCourse}: PropsType): JSX.Element => {
  const {t, i18n} = useTranslation();
  const localLang = i18n.language as keyof LocalizedString;
  const instructionLang =
    course.languageOfInstructionCodes[0].toUpperCase() as Language;

  const otherLanguages = ['fi', 'en', 'sv'].filter(
    lang => lang !== i18n.language
  );

  const getCourseLanguage = (): string => {
    const found = sisuLanguageOptions.find(lang => lang.id === instructionLang);

    if (!found) {
      return 'unknown';
    }

    return found.language[localLang];
  };

  return (
    <StyledCard>
      <CardContent>
        <Typography gutterBottom sx={{color: 'text.secondary', fontSize: 14}}>
          {course.organizationName[localLang]}
        </Typography>
        <Typography variant="h5" component="div">
          {course.name[localLang]}
        </Typography>
        <Typography sx={{color: 'text.secondary', mb: 1.5}}>
          {otherLanguages.map(lang => (
            <Fragment key={lang}>
              {lang}: {course.name[lang as keyof LocalizedString]}
              <br />
            </Fragment>
          ))}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: {xs: 1, sm: 2},
            my: 2,
            flexDirection: {xs: 'column', sm: 'row'},
          }}
        >
          <Box>
            <Typography variant="body1">
              {t('course.edit.teachers-in-charge')}:
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: {xs: 'column', sm: 'row'},
            }}
          >
            {course.teachers.map(teacher => (
              <Chip sx={{mx: 1}} key={teacher} label={teacher} size="small" />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: {xs: 1, sm: 2},
            flexDirection: {xs: 'column', sm: 'row'},
          }}
        >
          <Box>
            <Typography variant="body1">
              {t('course.edit.language')}: {getCourseLanguage()}
              <br />
              {t('course.edit.grading-scale')}:{' '}
              {course.summary.gradingScale[localLang]}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="body1">
              {t('course.edit.start-date')}: {course.startDate}
              <br />
              {t('course.edit.end-date')}: {course.endDate}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="body1">
              {t('course.edit.min-credits')}: {course.credits.min}
              <br />
              {t('course.edit.max-credits')}: {course.credits.max}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Box sx={{display: 'flex', marginLeft: 'auto'}}>
          <Button onClick={selectCourse} variant="contained">
            {t('general.select')}
          </Button>
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default SisuInstance;
