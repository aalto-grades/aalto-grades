// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Delete as DeleteIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {JSX, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  GradingScale,
  Language,
  NewCourseData,
} from '@/common/types';
import {useAddCourse} from '../../hooks/useApi';
import {convertToClientGradingScale} from '../../utils/textFormat';
import {sisuLanguageOptions} from '../../utils/utils';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import FormField from '../shared/FormikField';
import FormLanguagesField from '../shared/FormikLanguageField';

const ValidationSchema = z
  .object({
    courseCode: z
      .string({required_error: 'Course code is required (e.g. CS-A1111)'})
      .min(1),
    minCredits: z
      .number({required_error: 'Minimum credits is required'})
      .min(0, 'Minimum credits cannot be negative'),
    maxCredits: z.number({required_error: 'Maximum credits is required'}),
    gradingScale: z.nativeEnum(GradingScale),
    languageOfInstruction: z.nativeEnum(Language),
    teacherEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
    assistantEmail: z.union([z.literal(''), AaltoEmailSchema.optional()]),
    departmentEn: z
      .string({
        required_error:
          'Please input the organizing department of the course in English',
      })
      .min(1),
    departmentFi: z
      .string({
        required_error:
          'Please input the organizing department of the course in Finnish',
      })
      .min(1),
    departmentSv: z
      .string({
        required_error:
          'Please input the organizing department of the course in Swedish',
      })
      .min(1),
    nameEn: z
      .string({required_error: 'Please input a valid course name in English'})
      .min(1),
    nameFi: z
      .string({required_error: 'Please input a valid course name in Finnish'})
      .min(1),
    nameSv: z
      .string({required_error: 'Please input a valid course name in Swedish'})
      .min(1),
  })
  .refine(val => val.maxCredits >= val.minCredits, {
    path: ['maxCredits'],
    message: 'Maximum credits cannot be lower than minimum credits',
  });

type FormData = {
  courseCode: string;
  minCredits: number;
  maxCredits: number;
  gradingScale: GradingScale;
  teacherEmail: string;
  assistantEmail: string;
  departmentEn: string;
  departmentFi: string;
  departmentSv: string;
  languageOfInstruction: Language;
  nameEn: string;
  nameFi: string;
  nameSv: string;
};

const initialValues = {
  courseCode: '',
  minCredits: 0,
  maxCredits: 0,
  gradingScale: GradingScale.Numerical,
  languageOfInstruction: Language.English,
  teacherEmail: '',
  assistantEmail: '',
  departmentEn: '',
  departmentFi: '',
  departmentSv: '',
  nameEn: '',
  nameFi: '',
  nameSv: '',
};

type PropsType = {open: boolean; onClose: () => void};
const CreateCourseDialog = ({open, onClose}: PropsType): JSX.Element => {
  const navigate = useNavigate();
  const addCourse = useAddCourse();

  const [teachersInCharge, setTeachersInCharge] = useState<string[]>([]);
  const [assistants, setAssistants] = useState<string[]>([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState<boolean>(false);

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(teachersInCharge.filter(teacher => teacher !== value));
  };

  const removeAssistant = (value: string): void => {
    setAssistants(assistants.filter(assistant => assistant !== value));
  };

  const handleSubmit = (
    values: FormData,
    {setSubmitting}: FormikHelpers<FormData>
  ): void => {
    const courseData: NewCourseData = {
      courseCode: values.courseCode,
      minCredits: values.minCredits,
      maxCredits: values.maxCredits,
      gradingScale: values.gradingScale,
      languageOfInstruction: values.languageOfInstruction,
      department: {
        fi: values.departmentFi,
        sv: values.departmentSv,
        en: values.departmentEn,
      },
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
        navigate(`/${newCourseId}`, {replace: true});
      },
      onError: () => setSubmitting(false),
    });
  };

  const validateForm = (
    values: FormData
  ): {[key in keyof FormData]?: string[]} | undefined => {
    const result = ValidationSchema.safeParse(values);
    if (result.success) return;
    const fieldErrors = result.error.formErrors.fieldErrors;
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([key, val]) => [key, val[0]]) // Only the first error
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validateForm}
      onSubmit={handleSubmit}
    >
      {form => (
        <>
          <UnsavedChangesDialog
            open={showUnsavedDialog}
            onClose={() => setShowUnsavedDialog(false)}
            handleDiscard={() => {
              onClose();
              form.resetForm();
              setTeachersInCharge([]);
              setAssistants([]);
            }}
          />
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Create a New Course</DialogTitle>
            <DialogContent dividers>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="courseCode"
                label="Course Code*"
                helperText="Give code for the new course."
              />
              <FormLanguagesField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                valueFormat="name%"
                labelFormat="Course Name in %*"
                helperTextFormat="Give the name of the course in %."
              />
              <FormLanguagesField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                valueFormat="department%"
                labelFormat="Organizing department in %*"
                helperTextFormat="Give the organizing department of the new course in %."
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="minCredits"
                label="Minimum Course Credits (ECTS)*"
                helperText="Input minimum credits."
                type="number"
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="maxCredits"
                label="Maximum Course Credits (ECTS)*"
                helperText="Input maximum credits."
                type="number"
              />
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="gradingScale"
                label="Grading Scale*"
                helperText="Grading scale of the course, e.g., 0-5 or pass/fail."
                select
              >
                {Object.values(GradingScale).map(value => (
                  <MenuItem key={value} value={value}>
                    {convertToClientGradingScale(value)}
                  </MenuItem>
                ))}
              </FormField>
              <FormField
                form={form as unknown as FormikProps<{[key: string]: unknown}>}
                value="languageOfInstruction"
                label="Course language*"
                helperText="Language in which the course will be conducted."
                select
              >
                {sisuLanguageOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.language}
                  </MenuItem>
                ))}
              </FormField>
              <TextField
                id="teacherEmail"
                type="text"
                fullWidth
                value={form.values.teacherEmail}
                disabled={form.isSubmitting}
                label="Teachers In Charge*"
                margin="normal"
                InputLabelProps={{shrink: true}}
                helperText={
                  form.errors.teacherEmail ??
                  (teachersInCharge.length === 0
                    ? 'Input the email address of at least one teacher in charge of the course'
                    : teachersInCharge.includes(form.values.teacherEmail)
                      ? 'Email already on list.'
                      : 'Add emails of the teachers in charge of the course.')
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
                  form.isSubmitting
                }
                onClick={() => {
                  setTeachersInCharge(oldTeachers =>
                    oldTeachers.concat(form.values.teacherEmail)
                  );
                  form.setFieldValue('teacherEmail', '');
                }}
                sx={{mt: 1}}
              >
                Add
              </Button>
              <Box sx={{mt: 3, mb: 2}}>
                {teachersInCharge.length === 0 ? (
                  'Add at least one teacher in charge to the course'
                ) : (
                  <List dense>
                    {teachersInCharge.map(teacherEmail => (
                      <ListItem
                        key={teacherEmail}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            disabled={form.isSubmitting}
                            aria-label="delete"
                            onClick={() => removeTeacher(teacherEmail)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={teacherEmail} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
              <TextField
                id="assistantEmail"
                type="text"
                fullWidth
                value={form.values.assistantEmail}
                disabled={form.isSubmitting}
                label="Assistants*"
                margin="normal"
                InputLabelProps={{shrink: true}}
                helperText={
                  form.errors.assistantEmail ??
                  (assistants.length === 0
                    ? 'Input the email address of at least one assitant of the course'
                    : assistants.includes(form.values.assistantEmail)
                      ? 'Email already on list.'
                      : 'Add emails of the teachers in charge of the course.')
                }
                error={
                  form.touched.assistantEmail &&
                  form.errors.assistantEmail !== undefined
                }
                onChange={form.handleChange}
              />
              <Button
                variant="outlined"
                startIcon={<PersonAddAlt1Icon />}
                disabled={
                  form.errors.assistantEmail !== undefined ||
                  form.values.assistantEmail.length === 0 ||
                  assistants.includes(form.values.assistantEmail) ||
                  form.isSubmitting
                }
                onClick={() => {
                  setAssistants(oldAssistants =>
                    oldAssistants.concat(form.values.assistantEmail)
                  );
                  form.setFieldValue('assistantEmail', '');
                }}
                sx={{mt: 1}}
              >
                Add
              </Button>
              <Box sx={{mt: 3, mb: 2}}>
                {assistants.length === 0 ? (
                  'No assistants in the course'
                ) : (
                  <List dense={true}>
                    {assistants.map((emailAssistant: string) => (
                      <ListItem
                        key={emailAssistant}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            disabled={form.isSubmitting}
                            aria-label="delete"
                            onClick={(): void => {
                              removeAssistant(emailAssistant);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={emailAssistant} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color={
                  JSON.stringify(initialValues) !== JSON.stringify(form.values)
                    ? 'error'
                    : 'primary'
                }
                disabled={form.isSubmitting}
                onClick={() => {
                  if (
                    JSON.stringify(initialValues) !==
                    JSON.stringify(form.values)
                  ) {
                    setShowUnsavedDialog(true);
                  } else {
                    onClose();
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                id="ag_create_course_btn"
                variant="contained"
                onClick={form.submitForm}
                disabled={form.isSubmitting}
              >
                Submit
                {form.isSubmitting && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Formik>
  );
};

export default CreateCourseDialog;
