// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Delete as DeleteIcon,
  MarkEmailUnreadTwoTone,
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
import {HTMLInputTypeAttribute, JSX, PropsWithChildren, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {
  AaltoEmailSchema,
  CreateCourseData,
  GradingScale,
  Language,
} from '@common/types';
import {useAddCourse} from '../../hooks/useApi';
import {sisuLanguageOptions} from '../../utils';
import {convertToClientGradingScale} from '../../utils/textFormat';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

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

const FormField = ({
  form,
  value,
  label,
  helperText,
  select,
  type,
  children,
}: {
  form: FormikProps<FormData>;
  value: keyof FormData;
  label: string;
  helperText: string;
  select?: boolean;
  type?: HTMLInputTypeAttribute;
} & PropsWithChildren): JSX.Element => (
  <TextField
    id={value}
    name={value}
    type={type ?? 'text'}
    fullWidth
    value={form.values[value]}
    disabled={form.isSubmitting}
    label={label}
    InputLabelProps={{shrink: true}}
    margin="normal"
    helperText={form.errors[value] ? form.errors[value] : helperText}
    error={form.touched[value] && Boolean(form.errors[value])}
    onChange={form.handleChange}
    select={select}
    // SelectProps={{native: true}}
    sx={{textAlign: 'left'}}
  >
    {children}
  </TextField>
);

const languages = [
  {value: 'En', name: 'English'},
  {value: 'Fi', name: 'Finnish'},
  {value: 'Sv', name: 'Swedish'},
];
const FormLanguagesField = ({
  form,
  valueFormat,
  labelFormat,
  helperTextFormat,
}: {
  form: FormikProps<FormData>;
  valueFormat: string;
  labelFormat: string;
  helperTextFormat: string;
}): JSX.Element => (
  <>
    {languages.map(language => (
      <FormField
        key={language.value}
        form={form}
        value={valueFormat.replace('%', language.value) as keyof FormData}
        label={labelFormat.replace('%', language.name)}
        helperText={helperTextFormat.replace('%', language.name)}
      />
    ))}
  </>
);

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
  const [email, setEmail] = useState<string>('');
  const [assistants, setAssistants] = useState<string[]>([]);
  const [assistantEmail, setAssistantEmail] = useState<string>('');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState<boolean>(false);

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(
      teachersInCharge.filter((teacher: string) => teacher !== value)
    );
  };

  const addTeacher = (): void => {
    setTeachersInCharge([...teachersInCharge, email]);
  };

  const removeAssistant = (value: string): void => {
    setAssistants(
      assistants.filter((teacher: string) => teacher !== value)
    );
  };

  const addAssistant = (): void => {
    setAssistants([...assistants, assistantEmail]);
  };

  const handleSubmit = (
    values: FormData,
    {setSubmitting}: FormikHelpers<FormData>
  ): void => {
    const courseData: CreateCourseData = {
      courseCode: values.courseCode,
      minCredits: values.minCredits,
      maxCredits: values.maxCredits,
      gradingScale: GradingScale.Numerical,
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
  ): {[key in keyof FormData]?: string[]} | void => {
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
                form={form}
                value="courseCode"
                label="Course Code*"
                helperText="Give code for the new course."
              />
              <FormLanguagesField
                form={form}
                valueFormat="name%"
                labelFormat="Course Name in %*"
                helperTextFormat="Give the name of the course in %."
              />
              <FormLanguagesField
                form={form}
                valueFormat="department%"
                labelFormat="Organizing department in %*"
                helperTextFormat="Give the organizing department of the new course in %."
              />
              <FormField
                form={form}
                value="minCredits"
                label="Minimum Course Credits (ECTS)*"
                helperText="Input minimum credits."
                type="number"
              />
              <FormField
                form={form}
                value="maxCredits"
                label="Maximum Course Credits (ECTS)*"
                helperText="Input maximum credits."
                type="number"
              />
              <FormField
                form={form}
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
                form={form}
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
                  form.errors.teacherEmail
                    ? form.errors.teacherEmail
                    : teachersInCharge.length === 0
                    ? 'Input the email address of at least one teacher in charge of the course'
                    : teachersInCharge.includes(email)
                    ? 'Email already on list.'
                    : 'Add emails of the teachers in charge of the course.'
                }
                error={
                  form.touched.teacherEmail && Boolean(form.errors.teacherEmail)
                }
                onChange={e => {
                  setEmail(e.currentTarget.value);
                  form.handleChange(e);
                }}
              />
              <Button
                variant="outlined"
                startIcon={<PersonAddAlt1Icon />}
                disabled={
                  // Allow submit of email only if validation passes and not on list.
                  Boolean(form.errors.teacherEmail) ||
                  form.values.teacherEmail.length === 0 ||
                  teachersInCharge.includes(email) ||
                  form.isSubmitting
                }
                onClick={() => addTeacher()}
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
                      form.errors.assistantEmail
                        ? form.errors.assistantEmail
                        : assistants.length === 0
                        ? 'Input the email address of at least one assitant of the course'
                        : assistants.includes(email)
                        ? 'Email already on list.'
                        : 'Add emails of the teachers in charge of the course.'
                    }
                    error={
                      form.touched.assistantEmail &&
                      Boolean(form.errors.assistantEmail)
                    }
                    onChange={e => {
                      setAssistantEmail(e.currentTarget.value);
                      form.handleChange(e);
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddAlt1Icon />}
                    disabled={
                      // Allow submit of email only if validation passes and not on list.
                      Boolean(form.errors.assistantEmail) ||
                      form.values.assistantEmail.length === 0 ||
                      assistants.includes(email) ||
                      form.isSubmitting
                    }
                    onClick={(): void => addAssistant()}
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
