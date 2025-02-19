// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Delete as DeleteIcon,
  HelpOutlined,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Person as PersonIcon,
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {type FormikHelpers, type FormikProps, useFormik} from 'formik';
import {type JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  Department,
  GradingScale,
  GradingScaleSchema,
  Language,
  LanguageSchema,
  type NewCourseData,
  type SisuCourseInstance,
} from '@/common/types';
import FormField from '@/components/shared/FormikField';
import FormLanguagesField from '@/components/shared/FormikLanguageField';
import LoadingButton from '@/components/shared/LoadingButton';
import {useSearchSisuCourses} from '@/hooks/api/sisu';
import {useAddCourse, useVerifyEmail} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {useLocalize} from '@/hooks/useLocalize';
import {type AssistantData, nullableDateSchema} from '@/types';
import {
  convertSisuToClientGradingScale,
  convertToClientGradingScale,
  departments,
  getToken,
  sisuLanguageOptions,
} from '@/utils';
import {withZodSchema} from '@/utils/forms';
import SisuCourseDialog from './SisuCourseDialog';

type FormData = {
  courseCode: string;
  department: Department;
  minCredits: number;
  maxCredits: number;
  gradingScale: GradingScale;
  teacherEmail: string;
  assistantEmail: string;
  assistantExpiryDate: string;
  languageOfInstruction: Language;
  nameEn: string;
  nameFi: string;
  nameSv: string;
};

const initialValues = {
  courseCode: '',
  department: Department.ComputerScience,
  minCredits: 0,
  maxCredits: 0,
  gradingScale: GradingScale.Numerical,
  languageOfInstruction: Language.English,
  teacherEmail: '',
  assistantEmail: '',
  assistantExpiryDate: '',
  nameEn: '',
  nameFi: '',
  nameSv: '',
};

/**
 * Generates an email address based on the given name. Normalizes Scandinavian
 * characters (ä, å → a and ö → o) and constructs an email address in the format
 * 'firstname.lastname@aalto.fi'. Drops middle names. Sisu API does not provide
 * email addresses any incorrect emails must be manually corrected during the
 * course creation process by the user.
 */
const generateEmailAddressString = (name: string): string => {
  const normalize = (str: string): string =>
    str.replace(/[äå]/g, 'a').replace(/ö/g, 'o');

  const parts = name.split(' ');
  const firstName = normalize(parts[0]);
  const lastName = normalize(parts[parts.length - 1]);

  return `${firstName}.${lastName}@aalto.fi`.toLowerCase();
};

const sisuInstanceToForm = (instance: SisuCourseInstance): FormData => {
  const data = {
    courseCode: instance.code,
    department: Department.ComputerScience,
    minCredits: instance.credits.min,
    maxCredits: instance.credits.max,
    gradingScale: convertSisuToClientGradingScale(
      instance.summary.gradingScale.en
    ) as GradingScale,
    languageOfInstruction: Language.English,
    teacherEmail: '',
    assistantEmail: '',
    assistantExpiryDate: '',
    nameEn: instance.name.en,
    nameFi: instance.name.fi,
    nameSv: instance.name.sv,
  };

  const department = departments.find(
    d => d.department.en === instance.organizationName.en
  );

  if (department) {
    data.department = department.id;
  }

  // Instruction language, use first one from list
  if (instance.languageOfInstructionCodes[0].length > 0) {
    data.languageOfInstruction =
      instance.languageOfInstructionCodes[0].toUpperCase() as Language;
  }

  return data;
};

type PropsType = {open: boolean; forceEmail?: string; onClose: () => void};

const CreateCourseDialog = ({
  open,
  onClose,
  forceEmail,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const localize = useLocalize();
  const navigate = useNavigate();
  const addCourse = useAddCourse();
  const emailExisted = useVerifyEmail();
  const hasApiKey = getToken('sisu') !== null;

  const [teachersInCharge, setTeachersInCharge] = useState<string[]>(
    forceEmail ? [forceEmail] : []
  );
  const [nonExistingEmails, setNonExistingEmails] = useState<Set<string>>(
    new Set<string>()
  );
  const [assistants, setAssistants] = useState<AssistantData[]>([]);
  const [queryString, setQueryString] = useState<string>('');
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const {data, isLoading, isFetching} = useSearchSisuCourses(queryString, {
    enabled: queryString.length > 0,
  });

  const validationSchema = z
    .object({
      courseCode: z
        .string({
          required_error: t('course.edit.course-code-required'),
        })
        .min(1, t('course.edit.course-code-required')),
      minCredits: z
        .number({
          required_error: t('course.edit.min-credits-required'),
        })
        .min(0, t('course.edit.min-credits-negative')),
      maxCredits: z.number({
        required_error: t('course.edit.max-credits-required'),
      }),
      gradingScale: GradingScaleSchema,
      languageOfInstruction: LanguageSchema,
      teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
      assistantExpiryDate: z.string().or(z.date().nullable()),
      department: z.nativeEnum(Department),
      nameEn: z
        .string({required_error: t('course.edit.name-english')})
        .min(1, t('course.edit.name-english')),
      nameFi: z
        .string({required_error: t('course.edit.name-finnish')})
        .min(1, t('course.edit.name-finnish')),
      nameSv: z
        .string({required_error: t('course.edit.name-swedish')})
        .min(1, t('course.edit.name-swedish')),
    })
    .refine(val => val.maxCredits >= val.minCredits, {
      path: ['maxCredits'],
      message: t('course.edit.max-below-min'),
    });

  const AssistantValidationSchema = z.strictObject({
    email: z.string().email(),
    expiryDate: nullableDateSchema(t),
  });

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(teachersInCharge.filter(teacher => teacher !== value));
  };

  const removeAssistant = (value: AssistantData): void => {
    setAssistants(
      assistants.filter(assistant => assistant.email !== value.email)
    );
  };

  const form = useFormik<FormData>({
    validateOnChange: true,
    initialValues,
    validate: withZodSchema(validationSchema),
    onSubmit: values => {
      const courseData: NewCourseData = {
        courseCode: values.courseCode,
        minCredits: values.minCredits,
        maxCredits: values.maxCredits,
        gradingScale: values.gradingScale,
        languageOfInstruction: values.languageOfInstruction,
        department: values.department,
        name: {
          fi: values.nameFi,
          sv: values.nameSv,
          en: values.nameEn,
        },
        teachersInCharge,
        assistants,
      };

      addCourse.mutate(courseData, {
        onSuccess: newCourseId => {
          navigate(`/${newCourseId}`);
        },
      });
    },
  });

  const confirmDiscard = async ({
    resetForm,
  }: FormikHelpers<FormData>): Promise<void> => {
    if (await AsyncConfirmationModal({confirmNavigate: true})) {
      onClose();
      resetForm();
      setTeachersInCharge([]);
      setAssistants([]);
    }
  };

  const validateTeacher = async (email: string): Promise<void> => {
    const isEmailExisted = await emailExisted.mutateAsync({
      email,
    });

    if (!isEmailExisted.exists) {
      setNonExistingEmails(oldNonExistingEmail =>
        oldNonExistingEmail.add(email)
      );
    }

    setTeachersInCharge(oldTeachers => oldTeachers.concat(email));
    form.setFieldValue('teacherEmail', '');
  };

  const sortedDepartments = [...departments].sort((a, b) =>
    localize(a.department).localeCompare(localize(b.department))
  );

  const fetchSisu = (courseCode: string): void => {
    setShowDialog(true);
    setQueryString(courseCode.trim());
  };

  const resetForm = (): void => {
    form.resetForm();
    setTeachersInCharge([]);
    setAssistants([]);
    setNonExistingEmails(new Set());
  };

  const selectCourse = async (course: SisuCourseInstance): Promise<void> => {
    resetForm();
    setShowDialog(false);
    form.setValues(sisuInstanceToForm(course));

    // Teachers in charge, validate one by one
    for (let i = 0; i < course.teachers.length; ++i) {
      await validateTeacher(generateEmailAddressString(course.teachers[i]));
    }
  };

  return (
    <>
      {showDialog && data !== undefined && (
        <SisuCourseDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          selectCourse={selectCourse}
          courses={data}
          queryString={queryString}
        />
      )}
      <form onSubmit={form.handleSubmit}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle>{t('front-page.create-new-course')}</DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                display: 'flex',
                gap: {xs: 0, sm: 2},
                flexDirection: {xs: 'column', sm: 'row'},
              }}
            >
              <Box sx={{width: {xs: '100%', sm: '60%'}}}>
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="courseCode"
                  label={`${t('general.course-code')}*`}
                  helperText={t('course.edit.course-code-help')}
                  disabled={form.isSubmitting || isLoading || isFetching}
                />
              </Box>
              <Box
                sx={{
                  width: {xs: '100%', sm: '40%'},
                  alignContent: 'center',
                  mt: {xs: 0, sm: 2},
                  gap: {xs: 2, sm: 0},
                  display: 'flex',
                  flexDirection: {xs: 'row', sm: 'column'},
                }}
              >
                <Box>
                  <LoadingButton
                    loading={isLoading || isFetching}
                    onClick={() => fetchSisu(form.values.courseCode)}
                    disabled={form.values.courseCode.length === 0 || !hasApiKey}
                    variant="outlined"
                    startIcon={<SearchIcon />}
                  >
                    {t('course.edit.sisu-search-button')}
                  </LoadingButton>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color={hasApiKey ? undefined : 'error'}
                  >
                    {hasApiKey
                      ? t('course.edit.sisu-search-button-helper')
                      : t('course.edit.sisu-search-set-key')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <FormLanguagesField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              valueFormat="name%"
              labelFormat={`${t('course.edit.course-name-in-format')}*`}
              helperTextFormat={t('course.edit.course-name-in-help-format')}
              disabled={form.isSubmitting || isLoading || isFetching}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: 'column',
                  width: {xs: '100%', sm: '50%'},
                }}
              >
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="department"
                  label={`${t('general.organizing-department')}*`}
                  helperText={t('course.edit.organizing-department-help')}
                  disabled={form.isSubmitting || isLoading || isFetching}
                  select
                >
                  {sortedDepartments.map(department => (
                    <MenuItem key={department.id} value={department.id}>
                      {localize(department.department)}
                    </MenuItem>
                  ))}
                </FormField>
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="gradingScale"
                  label={`${t('course.edit.grading-scale')}*`}
                  helperText={t('course.edit.grading-scale-help')}
                  disabled={form.isSubmitting || isLoading || isFetching}
                  select
                >
                  {Object.values(GradingScale).map(value => (
                    <MenuItem key={value} value={value}>
                      {convertToClientGradingScale(t, value)}
                    </MenuItem>
                  ))}
                </FormField>
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="languageOfInstruction"
                  label={`${t('course.edit.language')}*`}
                  helperText={t('course.edit.language-help')}
                  disabled={form.isSubmitting || isLoading || isFetching}
                  select
                >
                  {sisuLanguageOptions.map(option => (
                    <MenuItem key={option.id} value={option.id}>
                      {localize(option.language)}
                    </MenuItem>
                  ))}
                </FormField>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: 'column',
                  width: {xs: '100%', sm: '50%'},
                }}
              >
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="minCredits"
                  label={`${t('course.edit.min-credits')}*`}
                  helperText={t('course.edit.min-credits-help')}
                  disabled={form.isSubmitting || isLoading || isFetching}
                  type="number"
                />
                <FormField
                  form={
                    form as unknown as FormikProps<{[key: string]: unknown}>
                  }
                  value="maxCredits"
                  label={`${t('course.edit.max-credits')}*`}
                  helperText={t('course.edit.max-credits-help')}
                  disabled={form.isSubmitting || isLoading || isFetching}
                  type="number"
                />
              </Box>
            </Box>
            <TextField
              id="teacherEmail" // Must be in camelCase to match data
              type="text"
              fullWidth
              value={form.values.teacherEmail}
              disabled={form.isSubmitting || isLoading || isFetching}
              label={t('course.edit.teachers-in-charge')}
              margin="normal"
              slotProps={{inputLabel: {shrink: true}}}
              helperText={
                form.errors.teacherEmail ??
                (teachersInCharge.length === 0
                  ? t('course.edit.input-at-least-one-teacher')
                  : teachersInCharge.includes(form.values.teacherEmail)
                    ? t('course.edit.email-in-list')
                    : t('course.edit.add-teacher-emails'))
              }
              error={
                form.touched.teacherEmail &&
                form.errors.teacherEmail !== undefined
              }
              onChange={form.handleChange}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              disabled={
                form.errors.teacherEmail !== undefined ||
                form.values.teacherEmail.length === 0 ||
                teachersInCharge.includes(form.values.teacherEmail) ||
                form.isSubmitting ||
                isLoading ||
                isFetching
              }
              onClick={async () => validateTeacher(form.values.teacherEmail)}
              sx={{mt: 1}}
            >
              {t('general.add')}
            </Button>
            <Box sx={{mt: 3, mb: 2}}>
              {teachersInCharge.length === 0 ? (
                t('course.edit.add-at-least-one-teacher')
              ) : (
                <List dense>
                  {teachersInCharge.map(teacherEmail => (
                    <ListItem
                      key={teacherEmail}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        justifyItems: 'start',
                        flexDirection: {xs: 'column', sm: 'row'},
                      }}
                      secondaryAction={
                        teacherEmail !== auth?.email && (
                          <IconButton
                            edge="end"
                            disabled={
                              form.isSubmitting || teacherEmail === auth?.email
                            }
                            aria-label="delete"
                            onClick={() => removeTeacher(teacherEmail)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )
                      }
                    >
                      <Box sx={{display: 'flex'}}>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={teacherEmail} />
                      </Box>
                      <Box>
                        {nonExistingEmails.has(teacherEmail) && (
                          <Alert
                            severity="warning"
                            sx={{width: {xs: '90%', sm: '80%'}}}
                          >
                            {t('course.edit.user-not-exist')}
                          </Alert>
                        )}
                        <Divider
                          sx={{my: 1, display: {xs: 'block', sm: 'none'}}}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <TextField
              id="assistantEmail" // Must be in camelCase to match data
              type="text"
              fullWidth
              value={form.values.assistantEmail}
              disabled={form.isSubmitting || isLoading || isFetching}
              label={t('general.assistants')}
              margin="normal"
              slotProps={{inputLabel: {shrink: true}}}
              helperText={
                form.errors.assistantEmail ??
                (assistants.length === 0
                  ? t('course.edit.input-at-least-one-assistant')
                  : assistants
                        .map(assistant => assistant.email)
                        .includes(form.values.assistantEmail)
                    ? t('course.edit.email-in-list')
                    : t('course.edit.add-assistant-emails'))
              }
              error={
                form.touched.assistantEmail &&
                form.errors.assistantEmail !== undefined
              }
              onChange={form.handleChange}
            />
            <FormField
              form={form as unknown as FormikProps<{[key: string]: unknown}>}
              value="assistantExpiryDate"
              label={t('course.edit.assistant-expiry-date')}
              helperText={t('course.edit.assistant-expiry-date-helper')}
              disabled={form.isSubmitting || isLoading || isFetching}
              type="date"
              InputProps={{
                inputProps: {min: new Date().toISOString().slice(0, 10)},
              }}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              disabled={
                form.errors.assistantEmail !== undefined ||
                form.values.assistantEmail.length === 0 ||
                assistants
                  .map(assistant => assistant.email)
                  .includes(form.values.assistantEmail) ||
                form.isSubmitting ||
                isLoading ||
                isFetching
              }
              onClick={async () => {
                const assistantEmail = form.values.assistantEmail;
                const assistantExpiryDate =
                  form.values.assistantExpiryDate === ''
                    ? null
                    : form.values.assistantExpiryDate;
                const isEmailExisted = await emailExisted.mutateAsync({
                  email: assistantEmail,
                });
                if (!isEmailExisted.exists) {
                  setNonExistingEmails(oldNonExistingEmail =>
                    oldNonExistingEmail.add(assistantEmail)
                  );
                }
                setAssistants(oldAssistants =>
                  oldAssistants.concat(
                    AssistantValidationSchema.parse({
                      email: assistantEmail,
                      expiryDate: assistantExpiryDate,
                    })
                  )
                );
                form.setFieldValue('assistantEmail', '');
                form.setFieldValue('assistantExpiryDate', '');
              }}
              sx={{mt: 1}}
            >
              {t('general.add')}
            </Button>
            <Box sx={{mt: 3, mb: 2}}>
              {assistants.length === 0 ? (
                t('course.edit.no-assistants')
              ) : (
                <List dense>
                  {assistants.map((assistant: AssistantData) => (
                    <ListItem
                      key={assistant.email}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                        justifyItems: 'start',
                        flexDirection: {xs: 'column', sm: 'row'},
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          disabled={form.isSubmitting}
                          aria-label="delete"
                          onClick={(): void => {
                            removeAssistant(assistant);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <Box sx={{display: 'flex'}}>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={assistant.email} />
                      </Box>
                      <Box>
                        {assistant.expiryDate && (
                          <Box sx={{display: 'flex', justifyContent: 'start'}}>
                            <Box>
                              <ListItemText
                                secondary={t(
                                  'course.edit.assistant-expiry-date-info',
                                  {
                                    expiryDate: assistant.expiryDate
                                      .toISOString()
                                      .slice(0, 10),
                                  }
                                )}
                                sx={{
                                  marginRight: '0.5em',
                                }}
                              />
                            </Box>
                            <Box>
                              <Tooltip
                                placement="top"
                                title={t(
                                  'course.edit.assistant-expiry-date-change'
                                )}
                              >
                                <ListItemIcon>
                                  <HelpOutlined
                                    sx={{
                                      width: '0.6em',
                                    }}
                                  />
                                </ListItemIcon>
                              </Tooltip>
                            </Box>
                          </Box>
                        )}
                        {nonExistingEmails.has(assistant.email) && (
                          <Alert severity="warning">
                            {t('course.edit.user-not-exist')}
                          </Alert>
                        )}
                        <Divider
                          sx={{my: 1, display: {xs: 'block', sm: 'none'}}}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={resetForm}
                disabled={form.isSubmitting || isLoading || isFetching}
              >
                {t('general.clear')}
              </Button>
              <Box sx={{display: 'flex', gap: 2}}>
                <Button
                  variant="outlined"
                  color={
                    JSON.stringify(initialValues) !==
                    JSON.stringify(form.values)
                      ? 'error'
                      : 'primary'
                  }
                  disabled={form.isSubmitting || isLoading || isFetching}
                  onClick={() => {
                    if (
                      JSON.stringify(initialValues) !==
                      JSON.stringify(form.values)
                    ) {
                      confirmDiscard(form);
                    } else {
                      onClose();
                    }
                  }}
                >
                  {t('general.cancel')}
                </Button>
                <LoadingButton
                  loading={form.isSubmitting}
                  variant="contained"
                  onClick={form.submitForm}
                  disabled={form.isSubmitting || isLoading || isFetching}
                >
                  {t('general.submit')}
                </LoadingButton>
              </Box>
            </Box>
          </DialogActions>
        </Dialog>
      </form>
    </>
  );
};

export default CreateCourseDialog;
