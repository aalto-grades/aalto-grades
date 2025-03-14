// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
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
  useTheme,
} from '@mui/material';
import MuiAccordion, {type AccordionProps} from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, {
  type AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
// eslint-disable-next-line import/no-named-as-default
import DOMPurify from 'dompurify';
import {Fragment, type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {
  Language,
  LocalizedString,
  SisuCourseInstance,
} from '@/common/types';
import {sisuLanguageOptions} from '@/utils';

const StyledCard = styled(Card)(({theme}) => ({
  padding: theme.spacing(1),
  height: '100%',
  minHeight: '170px',
  display: 'flex',
  flexDirection: 'column',
}));

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion sx={{mb: 1.5}} disableGutters elevation={0} square {...props} />
))(({theme}) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={
      <Box
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '1px solid black',
        }}
      >
        <ArrowForwardIosSharpIcon
          sx={theme => ({
            fontSize: '0.9rem',
            color: theme.palette.primary.dark,
          })}
        />
      </Box>
    }
    {...props}
  />
))(({theme}) => ({
  backgroundColor: theme.palette.grey[300],
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(90deg)',
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.grey[700],
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({theme}) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

// Highlights matching parts of the course code based on the search query
const HighlightedText = (
  query: string = '',
  text: string = ''
): JSX.Element => {
  const theme = useTheme();
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={index}
            style={{
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.16)'
                  : '#dbedff',
              borderRadius: '1.5px',
              border:
                theme.palette.mode === 'dark'
                  ? '1.5px dotted rgba(255, 255, 255, 0.7)'
                  : '1.5px dotted #484848',
              padding: '1px 0',
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

type PropsType = {
  course: SisuCourseInstance;
  selectCourse: () => void;
  queryString: string;
};

const SisuInstance = ({
  course,
  selectCourse,
  queryString,
}: PropsType): JSX.Element => {
  const {t, i18n} = useTranslation();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [expandAll, setExpandAll] = useState<boolean>(false);

  const uiLang = i18n.language as keyof LocalizedString;
  const instructionLang =
    course.languageOfInstructionCodes[0].toUpperCase() as Language;
  const otherLanguages = ['fi', 'en', 'sv'].filter(
    lang => lang !== i18n.language
  );

  const getCourseLanguage = (): string => {
    const found = sisuLanguageOptions.find(lang => lang.id === instructionLang);

    if (!found) return '-';

    return found.language[uiLang];
  };

  const getContent = (content: string | null | undefined): JSX.Element => {
    if (
      content === null ||
      !content ||
      content.length === 0 ||
      content === '-'
    ) {
      return <>{t('general.no-content')}</>;
    }

    return (
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content),
        }}
      />
    );
  };

  const getGrading = (value: string): string => {
    switch (value) {
      case '0-5':
        return t('utils.scale-numerical');
      case 'hyl-hyv':
        return t('utils.scale-pass-fail');
      case 'toinen-kotim':
        return t('utils.scale-second-lang');
      default:
        return value;
    }
  };

  const toggleExpandAll = (): void => {
    setExpandAll(prev => {
      if (prev) setExpanded(false);
      return !prev;
    });
  };

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
      if (expandAll) return;
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <StyledCard>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            gap: {xs: 1, sm: 2},
            flexDirection: {xs: 'column-reverse', sm: 'row'},
          }}
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{display: 'flex', gap: 1}}
          >
            <Typography>{HighlightedText(queryString, course.code)}</Typography>
            <Typography sx={{color: 'text.secondary'}}>
              - {course.organizationName[uiLang]}
            </Typography>
          </Typography>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{color: 'text.secondary'}}
          >
            Sisu id: {course.id}
          </Typography>
        </Box>
        <Typography variant="h6" component="div">
          <b>{course.name[uiLang]}</b>
        </Typography>
        <Typography variant="subtitle2" sx={{color: 'text.secondary', mb: 1}}>
          {otherLanguages.map(lang => (
            <Fragment key={lang}>
              {lang}: {course.name[lang as keyof LocalizedString]}
              <br />
            </Fragment>
          ))}
        </Typography>
        <Box>
          <Typography variant="h6">
            <b>{t('course.edit.sisu-search-basic-information')}:</b>
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: {xs: 1, sm: 2},
            my: 1,
            flexDirection: {xs: 'column', sm: 'row'},
          }}
        >
          <Box>
            <Typography variant="subtitle2">
              {t('course.edit.teachers-in-charge')}:
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
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
            justifyContent: 'flex-start',
            gap: {xs: 1, sm: 2},
            flexDirection: {xs: 'column', sm: 'row'},
          }}
        >
          <Box>
            <Typography variant="subtitle2">
              {t('course.edit.language')}: {getCourseLanguage()}
              <br />
              {t('course.edit.grading-scale')}:{' '}
              {getGrading(course.summary.gradingScale[uiLang])}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="subtitle2">
              {t('course.edit.start-date')}: {course.startDate}
              <br />
              {t('course.edit.end-date')}: {course.endDate}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="subtitle2">
              {t('course.edit.min-credits')}: {course.credits.min}
              <br />
              {t('course.edit.max-credits')}: {course.credits.max}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button size="small" onClick={toggleExpandAll} sx={{mb: -1, mt: 1}}>
            {expandAll
              ? t('course.edit.sisu-search-accrodion-hide')
              : t('course.edit.sisu-search-accrodion-collapse')}
          </Button>
        </Box>
        <Box sx={{mt: 2}}>
          <Accordion
            expanded={expanded === 'panel1' || expandAll}
            onChange={handleChange('panel1')}
          >
            <AccordionSummary
              aria-controls="content-content"
              id="content-header"
            >
              <Typography component="span">
                {t('course.edit.sisu-search-content')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {getContent(course.summary.content[uiLang])}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === 'panel2' || expandAll}
            onChange={handleChange('panel2')}
          >
            <AccordionSummary
              aria-controls="additional-information-content"
              id="additional-information-header"
            >
              <Typography component="span">
                {t('course.edit.sisu-search-additional-information')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {getContent(course.summary.additionalInformation[uiLang])}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === 'panel3' || expandAll}
            onChange={handleChange('panel3')}
          >
            <AccordionSummary
              aria-controls="assesment-method-content"
              id="assesment-method-header"
            >
              <Typography component="span">
                {t('course.edit.sisu-search-assessment-methods')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                {getContent(course.summary.assesmentMethods[uiLang])}
              </Typography>
            </AccordionDetails>
          </Accordion>
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
