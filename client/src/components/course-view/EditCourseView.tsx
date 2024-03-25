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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {Form, Formik, FormikHelpers, FormikProps} from 'formik';
import {
  HTMLInputTypeAttribute,
  JSX,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {useParams} from 'react-router-dom';
import * as yup from 'yup';

import {CourseData, GradingScale, Language, UserData} from '@common/types';
import {enqueueSnackbar} from 'notistack';
import {useEditCourse, useGetCourse} from '../../hooks/useApi';
import {sisuLanguageOptions} from '../../utils';
import {convertToClientGradingScale} from '../../utils/textFormat';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

const validationSchema = yup.object({
  courseCode: yup
    .string()
    .min(1)
    .required('Course code is required (e.g. CS-A1111)'),
  minCredits: yup
    .number()
    .min(0, 'Minimum credits cannot be negative')
    .required('Minimum credits is required'),
  maxCredits: yup
    .number()
    .min(
      yup.ref('minCredits'),
      'Maximum credits cannot be lower than minimum credits'
    )
    .required('Maximum credits is required'),
  gradingScale: yup.string().oneOf(Object.values(GradingScale)).required(),
  languageOfInstruction: yup.string().oneOf(Object.values(Language)).required(),
  teacherEmail: yup
    .string()
    .email('Please input valid email address')
    .notRequired(),
  departmentEn: yup
    .string()
    .min(1)
    .required(
      'Please input the organizing department of the course in English'
    ),
  departmentFi: yup
    .string()
    .min(1)
    .required(
      'Please input the organizing department of the course in Finnish'
    ),
  departmentSv: yup
    .string()
    .min(1)
    .required(
      'Please input the organizing department of the course in Swedish'
    ),
  nameEn: yup
    .string()
    .min(1)
    .required('Please input a valid course name in English'),
  nameFi: yup
    .string()
    .min(1)
    .required('Please input a valid course name in Finnish'),
  nameSv: yup
    .string()
    .min(1)
    .required('Please input a valid course name in Swedish'),
});

type FormData = {
  courseCode: string;
  minCredits: number;
  maxCredits: number;
  gradingScale: GradingScale;
  teacherEmail: string;
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

export default function EditCourseView(): JSX.Element {
  const {courseId} = useParams() as {courseId: string};
  const editCourse = useEditCourse();
  const course = useGetCourse(courseId);

  const [teachersInCharge, setTeachersInCharge] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<FormData | null>(null);

  useEffect(() => {
    if (initialValues || !course.data) return;
    setInitialValues({
      courseCode: course.data.courseCode,
      minCredits: course.data.minCredits,
      maxCredits: course.data.maxCredits,
      gradingScale: course.data.gradingScale,
      languageOfInstruction: course.data.languageOfInstruction,
      teacherEmail: '',
      departmentEn: course.data.department.en,
      departmentFi: course.data.department.fi,
      departmentSv: course.data.department.sv,
      nameEn: course.data.name.en,
      nameFi: course.data.name.fi,
      nameSv: course.data.name.sv,
    });

    if (course.data.teachersInCharge) {
      setTeachersInCharge(
        course.data.teachersInCharge.map(
          (teacher: UserData) => teacher.email ?? ''
        )
      );
    }
  }, [course.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeTeacher = (value: string): void => {
    setTeachersInCharge(
      teachersInCharge.filter((teacher: string) => teacher !== value)
    );
  };

  const addTeacher = (): void => {
    setTeachersInCharge([...teachersInCharge, email]);
  };

  const handleSubmit = (
    values: FormData,
    {setSubmitting}: FormikHelpers<FormData>
  ): void => {
    const courseData: CourseData = {
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
      teachersInCharge: teachersInCharge.map(teacherEmail => {
        return {
          email: teacherEmail,
        } as unknown as {id: number; email: string}; // TODO: Fix type?
      }),
    };

    editCourse.mutate(
      {courseId: courseId, course: courseData},
      {
        onSuccess: () => {
          enqueueSnackbar('Course details saved.', {variant: 'success'});
          setSubmitting(false);
        },
      }
    );
  };

  if (!initialValues) return <Typography>Loading</Typography>;

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {form => (
          <>
            <UnsavedChangesDialog
              open={showDialog}
              onClose={() => setShowDialog(false)}
              handleDiscard={form.resetForm}
            />
            <Form>
              <Grid container justifyContent="space-around">
                <Grid item xs={5.5}>
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
                </Grid>
                <Grid item xs={5.5}>
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
                      form.touched.teacherEmail &&
                      Boolean(form.errors.teacherEmail)
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
                    sx={{mt: 1, float: 'left'}}
                  >
                    Add
                  </Button>
                  <Box sx={{mt: 8, mb: 2, width: '50%'}}>
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
                </Grid>
                <Grid item xs={12}>
                  <Button
                    id="ag_create_course_btn"
                    variant={'contained'}
                    type="submit"
                    disabled={form.isSubmitting}
                    sx={{float: 'right'}}
                  >
                    Save
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
                  {JSON.stringify(initialValues) !==
                    JSON.stringify(form.values) && (
                    <Button
                      variant="outlined"
                      disabled={form.isSubmitting}
                      sx={{float: 'right', mr: 2}}
                      color="error"
                      onClick={() => setShowDialog(true)}
                    >
                      Discard changes
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Form>
          </>
        )}
      </Formik>
    </>
  );
}
