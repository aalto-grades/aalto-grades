// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Add} from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {z} from 'zod';

import {GradingScale, StudentRow, SystemRole} from '@/common/types';
import {batchCalculateGraph} from '@/common/util/calculateGraph';
import CalculateFinalGradesDialog from './CalculateFinalGradesDialog';
import SisuDownloadDialog from './SisuDownloadDialog';
import {useTableContext} from '../../context/useTableContext';
import {useAddFinalGrades} from '../../hooks/api/finalGrade';
import {
  useGetAllAssessmentModels,
  useGetCourse,
  useGetGrades,
} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {findBestGrade} from '../../utils';
import {findLatestGrade} from '../../utils/table';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import UploadDialog from '../course-view/UploadDialog';

/**
 * Toggle a string in an array: Adds it if not present, removes it if already
 * present.
 */
const toggleString = (arr: string[], str: string): string[] => {
  const index = arr.indexOf(str);
  if (index > -1) arr.splice(index, 1);
  else arr.push(str);

  return arr;
};

const CourseResultsTableToolbar = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();
  const {
    table,
    gradeSelectOption,
    setGradeSelectOption,
    selectedAssessmentModel,
    setSelectedAssessmentModel,
  } = useTableContext();
  const navigate = useNavigate();
  const theme = useTheme();

  const allAssessmentModels = useGetAllAssessmentModels(courseId);
  const addFinalGrades = useAddFinalGrades(courseId);
  const getGrades = useGetGrades(courseId);
  const course = useGetCourse(courseId);

  const [showCalculateDialog, setShowCalculateDialog] =
    useState<boolean>(false);
  const [showSisuDialog, setShowSisuDialog] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [missingFinalGrades, setMissingFinalGrades] = useState<boolean>(false);

  const [uploadOpen, setUploadOpen] = useState<boolean>(false);

  // Filter out archived models
  const assessmentModels = useMemo(
    () =>
      allAssessmentModels.data !== undefined
        ? allAssessmentModels.data.filter(model => !model.archived)
        : undefined,
    [allAssessmentModels.data]
  );

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  useEffect(() => {
    setMissingFinalGrades(
      // Prevent exporting sisu csv if students without final grades found
      Boolean(
        table
          .getSelectedRowModel()
          .rows.find(
            selectedRow =>
              selectedRow.original.finalGrades === undefined ||
              selectedRow.original.finalGrades.length === 0
          )
      )
    );
    console.log('missingFinalGrades', missingFinalGrades);
    console.log(
      table
        .getSelectedRowModel()
        .rows.find(
          selectedRow =>
            selectedRow.original.finalGrades === undefined ||
            selectedRow.original.finalGrades.length === 0
        )
    );
  }, [table.getSelectedRowModel().rows]); // eslint-disable-line react-hooks/exhaustive-deps

  // // If asking for a refetch then it also update the selectedRows
  // // Refresh selectedRows for updating childrens state
  // const refreshFinalGrades = (): void => {
  //   getFinalGrades.refetch().then(newFinalGrades => {
  //     if (!newFinalGrades.data) return;
  //     setSelectedRows(oldSelectedRows =>
  //       oldSelectedRows.map(oldSelectedRow => ({
  //         ...oldSelectedRow,
  //         finalGrades: [
  //           ...newFinalGrades.data.filter(
  //             element => element.userId === oldSelectedRow.user.id
  //           ),
  //         ],
  //       }))
  //     );
  //   });
  // };

  // Firing the refetch after the transition for closing is finished
  // to avoid abrupt layout changes in the dialog
  const handleExitedSisuDialog = (): void => {
    getGrades.refetch();
  };

  // Triggers the calculation of final grades
  const handleCalculateFinalGrades = async (
    selectedRows: StudentRow[],
    assessmentModelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ): Promise<boolean> => {
    const model = assessmentModels?.find(
      assessmentModel => assessmentModel.id === assessmentModelId
    );
    if (model === undefined || course.data === undefined) return false;

    enqueueSnackbar('Calculating final grades...', {variant: 'info'});

    const finalGrades = batchCalculateGraph(
      model.graphStructure,
      selectedRows.map(selectedRow => ({
        userId: selectedRow.user.id,
        attainments: selectedRow.attainments.map(att => ({
          attainmentId: att.attainmentId,
          grade: findBestGrade(att.grades, {gradeSelectOption})!.grade, // TODO: Manage expired attainments
        })),
      }))
    );
    for (const grade of Object.values(finalGrades)) {
      let maxGrade;
      switch (course.data.gradingScale) {
        case GradingScale.Numerical:
          maxGrade = 5;
          break;
        case GradingScale.PassFail:
          maxGrade = 1;
          break;
        case GradingScale.SecondNationalLanguage:
          maxGrade = 2;
          break;
      }
      const Schema = z.number().int().min(0).max(maxGrade);
      const result = Schema.safeParse(grade.finalGrade);
      if (!result.success) {
        enqueueSnackbar(`Invalid final grade ${grade.finalGrade}`, {
          variant: 'error',
        });
        return false;
      }
    }
    await addFinalGrades.mutateAsync(
      selectedRows.map(selectedRow => ({
        userId: selectedRow.user.id,
        assessmentModelId,
        grade: finalGrades[selectedRow.user.id].finalGrade,
        date: dateOverride ? gradingDate : findLatestGrade(selectedRow),
        comment: null,
      }))
    );
    enqueueSnackbar('Final grades calculated successfully.', {
      variant: 'success',
    });
    // refreshFinalGrades();
    return true;
  };

  return (
    <>
      <Box
        sx={{
          // mx: 1,
          pt: 1,
          borderRadius: 200,
          display: 'flex',
          // backgroundColor: theme.vars.palette.hoverGrey2,
          // height: '45px',
        }}
      >
        {table.getSelectedRowModel().rows.length === 0 ? (
          <Button
            variant="tonal"
            onClick={() => setUploadOpen(true)}
            startIcon={<Add />}
          >
            Add Grades
          </Button>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              backgroundColor: theme.vars.palette.primary.light,
              // border: '1px solid black',
              borderRadius: 200,
            }}
          >
            <div style={{alignContent: 'center'}}>
              {table.getSelectedRowModel().rows.length} selected student
            </div>
            {editRights && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Tooltip
                  title={
                    table.getSelectedRowModel().rows.length === 0
                      ? 'Select at least one student number for grade calculation.'
                      : 'Calculate course final grades for selected students.'
                  }
                  placement="top"
                >
                  <span>
                    <Button
                      variant={
                        table.getSelectedRowModel().rows.length === 0
                          ? 'outlined'
                          : !missingFinalGrades
                            ? 'outlined'
                            : 'contained'
                      }
                      onClick={() => setShowCalculateDialog(true)}
                      disabled={table.getSelectedRowModel().rows.length === 0}
                    >
                      Calculate final grades
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    table.getSelectedRowModel().rows.length === 0
                      ? 'Select at least one student number for downloading grades.'
                      : missingFinalGrades
                        ? 'Grades with status "PENDING" cannot be downloaded, ' +
                          'unselect or calculate grades for these.'
                        : 'Download final course grades as a Sisu compatible CSV file.'
                  }
                  placement="top"
                >
                  <span>
                    <Button
                      variant="contained"
                      color={missingFinalGrades ? 'error' : 'primary'}
                      onClick={(): void => {
                        if (!missingFinalGrades) {
                          setShowSisuDialog(true);
                        }
                      }}
                      disabled={
                        table.getSelectedRowModel().rows.length !== 0 &&
                        missingFinalGrades
                      }
                    >
                      Download Sisu CSV
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          // mx: 1,
          py: 1,
          borderRadius: 200,
          display: 'flex',
          gap: 1,
          // backgroundColor: theme.vars.palette.hoverGrey2,
        }}
      >
        <Tooltip
          title="Group rows based on other colums"
          placement="top"
          disableInteractive
        >
          <GroupByButton />
        </Tooltip>
        {(assessmentModels?.length ?? 0) > 1 && (
          <Tooltip
            title="Show only course parts used in the model"
            placement="top"
            disableInteractive
          >
            <AssesmentFilterButton />
          </Tooltip>
        )}

        <Chip variant="outlined" label="Filters" />

        <input
          style={{
            borderRadius: '200px',
            border: '0px solid black',
            background: 'lightgrey',
            padding: '0px 15px',
          }}
          type="text"
          value={
            (table.getColumn('user_studentNumber')?.getFilterValue() ??
              '') as string
          }
          onChange={e => {
            table
              .getColumn('user_studentNumber')
              ?.setFilterValue(e.target.value);
          }}
          placeholder={'Search...'}
          className="w-36 border shadow rounded"
        />
      </Box>
      {/* <Box
        sx={{
          // mx: 1,
          p: 1,
          borderRadius: 200,
          display: 'flex',
          // backgroundColor: theme.vars.palette.hoverGrey2,
        }}
      >
        <FormControl>
          <InputLabel id="select-grade-select-option">
            Grade selection criterion
          </InputLabel>
          <Select
            labelId="select-grade-select-option"
            value={gradeSelectOption}
            label="Grade selection criterion"
            onChange={e =>
              setGradeSelectOption(e.target.value as GradeSelectOption)
            }
          >
            <MenuItem value="best">Select best grade</MenuItem>
            <MenuItem value="latest">Select latest grade</MenuItem>
          </Select>
        </FormControl>
      </Box> */}
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <UnsavedChangesDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        handleDiscard={() => navigate(-1)}
      />
      <CalculateFinalGradesDialog
        open={showCalculateDialog}
        onClose={() => setShowCalculateDialog(false)}
        selectedRows={table.getSelectedRowModel().rows.map(r => r.original)}
        gradeSelectOption={gradeSelectOption}
        calculateFinalGrades={handleCalculateFinalGrades}
      />
      <SisuDownloadDialog
        open={showSisuDialog}
        handleClose={() => setShowSisuDialog(false)}
        handleExited={handleExitedSisuDialog}
        selectedRows={table.getSelectedRowModel().rows.map(r => r.original)}
      />
    </>
  );
};

export default CourseResultsTableToolbar;

const GroupByButton = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const {table} = useTableContext();

  const isActive = useMemo(
    () => table.getState().grouping.length > 0,
    [table.getState().grouping]
  );

  return (
    <>
      <span style={{display: 'flex'}}>
        <ButtonBase
          style={{
            ...{
              display: 'flex',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid black',
              alignContent: 'center',
              padding: '0px 8px',
              fontSize: '14px',
              alignItems: 'center',
              lineHeight: '20px',
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: 'transparent',
            },
            ...(isActive && {
              backgroundColor: theme.vars.palette.info.light,
              border: 'none',
              borderRadius: '8px 0px 0px 8px',
            }),
          }}
          onClick={ev => {
            handleClick(ev);
          }}
        >
          <div
            style={{
              alignContent: 'center',
              padding: '0px 8px',
              width: 'max-content',
            }}
          >
            Group by {table.getState().grouping}
          </div>

          {!isActive && (
            <ArrowDropDownIcon
              style={{alignContent: 'center', fontSize: '18px'}}
            />
          )}
        </ButtonBase>
        {isActive && (
          <ButtonBase
            style={{
              ...{
                display: 'flex',
                borderRadius: '0px 8px 8px 0',
                textAlign: 'center',
                // border: '1px solid black',
                border: '0px 1px 1px 1px',
                alignContent: 'center',
                padding: '0px 8px',
                fontSize: '14px',
                alignItems: 'center',
                lineHeight: '20px',
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: 'transparent',
              },
              ...(isActive && {
                backgroundColor: theme.vars.palette.info.light,
                border: 'none',
              }),
            }}
            onClick={ev => {
              table.setGrouping([]);
            }}
          >
            <ClearIcon style={{alignContent: 'center', fontSize: '18px'}} />
          </ButtonBase>
        )}
      </span>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-ButtonBase',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        style={{
          maxHeight: '50vh',
        }}
      >
        <MenuItem
          key={'grouping'}
          selected={table.getState().grouping[0] === 'grouping'}
          onClick={() => {
            table.setGrouping(old =>
              structuredClone(toggleString(old, 'grouping'))
            );
            handleClose();
          }}
        >
          Latest Attainment
        </MenuItem>
        {table.getAllFlatColumns().map(column => (
          <MenuItem
            key={column.id}
            selected={table.getState().grouping.includes(column.id)}
            onClick={() => {
              table.setGrouping(old =>
                structuredClone(toggleString(old, column.id))
              );
              handleClose();
            }}
          >
            {column.id}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const AssesmentFilterButton = () => {
  const {courseId} = useParams() as {courseId: string};
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const {
    table,
    gradeSelectOption,
    setGradeSelectOption,
    selectedAssessmentModel,
    setSelectedAssessmentModel,
  } = useTableContext();

  const allAssessmentModels = useGetAllAssessmentModels(courseId);

  // Filter out archived models
  const assessmentModels = useMemo(
    () =>
      allAssessmentModels.data !== undefined
        ? allAssessmentModels.data.filter(model => !model.archived)
        : undefined,
    [allAssessmentModels.data]
  );

  const isActive = useMemo<boolean>(
    () => !!selectedAssessmentModel && selectedAssessmentModel !== 'any',
    [selectedAssessmentModel]
  );

  return (
    <>
      <span style={{display: 'flex'}}>
        <ButtonBase
          id="select-assessment-model-option"
          style={{
            ...{
              display: 'flex',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid black',
              alignContent: 'center',
              padding: '0px 8px',
              fontSize: '14px',
              alignItems: 'center',
              lineHeight: '20px',
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: 'transparent',
            },
            ...(isActive && {
              backgroundColor: theme.vars.palette.info.light,
              border: 'none',
              borderRadius: '8px 0px 0px 8px',
            }),
          }}
          onClick={ev => {
            handleClick(ev);
          }}
        >
          <div
            style={{
              alignContent: 'center',
              padding: '0px 8px',
              width: 'max-content',
            }}
          >
            {isActive
              ? assessmentModels?.filter(
                  ass => ass.id === selectedAssessmentModel
                )[0]?.name
              : 'Grading Model'}
          </div>

          {!isActive && (
            <ArrowDropDownIcon
              style={{alignContent: 'center', fontSize: '18px'}}
            />
          )}
        </ButtonBase>
        {isActive && (
          <ButtonBase
            style={{
              ...{
                display: 'flex',
                borderRadius: '0px 8px 8px 0',
                textAlign: 'center',
                // border: '1px solid black',
                border: '0px 1px 1px 1px',
                alignContent: 'center',
                padding: '0px 8px',
                fontSize: '14px',
                alignItems: 'center',
                lineHeight: '20px',
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: 'transparent',
              },
              ...(isActive && {
                backgroundColor: theme.vars.palette.info.light,
                border: 'none',
              }),
            }}
            onClick={ev => {
              setSelectedAssessmentModel('any');
            }}
          >
            <ClearIcon style={{alignContent: 'center', fontSize: '18px'}} />
          </ButtonBase>
        )}
      </span>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-ButtonBase',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        style={{
          maxHeight: '50vh',
        }}
      >
        {(assessmentModels ?? []).map(model => (
          <MenuItem
            onClick={() => {
              setSelectedAssessmentModel(model.id);
              handleClose();
            }}
            key={`assessment-model-select-${model.id}`}
            value={model.id}
            selected={selectedAssessmentModel === model.id}
          >
            {model.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
