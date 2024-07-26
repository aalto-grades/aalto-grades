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
  Divider,
  Fade,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, forwardRef, useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {z} from 'zod';

import {StudentRow, SystemRole} from '@/common/types';
import {batchCalculateGraph} from '@/common/util/calculateGraph';
import CalculateFinalGradesDialog from './CalculateFinalGradesDialog';
import SisuDownloadDialog from './SisuDownloadDialog';
import {useTableContext} from '../../context/useTableContext';
import {useAddFinalGrades} from '../../hooks/api/finalGrade';
import {
  useGetAllGradingModels,
  useGetCourse,
  useGetGrades,
} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {findBestGrade} from '../../utils/bestGrade';
import {findLatestGrade, getErrorCount} from '../../utils/table';
import {getMaxFinalGrade} from '../../utils/utils';
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
const GroupByButton = forwardRef<HTMLSpanElement>((props, ref): JSX.Element => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchorEl(null);
  };
  const {table} = useTableContext();
  const groupByElements = [
    [
      {
        id: 'latestBestGrade',
        name: 'Latest part date',
        info: 'Group by the latest obtainment date of all course parts',
      },
      {id: 'Exported to Sisu', name: 'Exported to Sisu'},
      {id: 'finalGrade', name: 'Final grade'},
    ],
    [
      ...table
        .getAllColumns()
        .filter(c => c.columnDef.meta?.coursePart)
        .map(column => ({
          id: column.id,
          name: column.id,
          info: column.id,
        })),
    ],
  ];

  const tableGrouping = table.getState().grouping;
  const isActive = useMemo(() => tableGrouping.length > 0, [tableGrouping]);

  return (
    <>
      <span {...props} style={{display: 'flex'}} ref={ref}>
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
          onClick={handleClick}
        >
          <div
            style={{
              alignContent: 'center',
              padding: '0px 8px',
              width: 'max-content',
            }}
          >
            Group by{' '}
            {groupByElements
              .flat()
              .filter(el => table.getState().grouping.includes(el.id))
              .map(el => el.name)
              .join(', ')}
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
              // ...(isActive && {
              backgroundColor: theme.vars.palette.info.light,
              border: 'none',
              // }),
            }}
            onClick={() => table.setGrouping([])}
          >
            <ClearIcon style={{alignContent: 'center', fontSize: '18px'}} />
          </ButtonBase>
        )}
      </span>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        style={{
          maxHeight: '50vh',
        }}
      >
        {groupByElements.map((groups, i) => [
          ...groups.map(element => (
            <Tooltip
              key={element.id}
              title={element.info}
              placement="top"
              disableInteractive
            >
              <MenuItem
                selected={table.getState().grouping.includes(element.id)}
                onClick={() => {
                  console.log(table.getAllColumns());
                  table.setGrouping(old =>
                    structuredClone(toggleString(old, element.id))
                  );
                  handleClose();
                }}
              >
                {element.name}
              </MenuItem>
            </Tooltip>
          )),

          // Only add divider between elements
          ...[
            i !== groupByElements.length - 1 ? [<Divider sx={{my: 0}} />] : [],
          ],
        ])}
      </Menu>
    </>
  );
});

const AssesmentFilterButton = forwardRef<HTMLSpanElement>(
  (props, ref): JSX.Element => {
    const {courseId} = useParams() as {courseId: string};
    const theme = useTheme();
    const {table} = useTableContext();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = (): void => {
      setAnchorEl(null);
    };

    const {selectedGradingModel, setSelectedGradingModel} = useTableContext();

    const allGradingModels = useGetAllGradingModels(courseId);

    // Filter out archived models
    const gradingModels = useMemo(
      () =>
        allGradingModels.data !== undefined
          ? allGradingModels.data.filter(model => !model.archived)
          : undefined,
      [allGradingModels.data]
    );

    const isActive = useMemo<boolean>(
      () => Boolean(selectedGradingModel) && selectedGradingModel !== 'any',
      [selectedGradingModel]
    );

    return (
      <>
        <span {...props} style={{display: 'flex'}} ref={ref}>
          <ButtonBase
            id="select-grading-model-option"
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
            onClick={handleClick}
          >
            <div
              style={{
                alignContent: 'center',
                padding: '0px 8px',
                width: 'max-content',
              }}
            >
              {isActive
                ? gradingModels?.filter(
                    ass => ass.id === selectedGradingModel
                  )[0]?.name
                : 'Grading model'}
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
                // ...(isActive && {
                backgroundColor: theme.vars.palette.info.light,
                border: 'none',
                // }),
              }}
              onClick={() => {
                setSelectedGradingModel('any');
              }}
            >
              <ClearIcon style={{alignContent: 'center', fontSize: '18px'}} />
            </ButtonBase>
          )}
        </span>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          style={{
            maxHeight: '50vh',
          }}
        >
          {(gradingModels ?? []).map(model => (
            <MenuItem
              key={model.id}
              onClick={() => {
                table.resetColumnFilters();
                setSelectedGradingModel(model.id);
                handleClose();
              }}
              value={model.id}
              selected={selectedGradingModel === model.id}
            >
              {model.name}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
);

const CourseResultsTableToolbar = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();
  const {table, gradeSelectOption, selectedGradingModel} = useTableContext();
  const theme = useTheme();

  const allGradingModels = useGetAllGradingModels(courseId);
  const addFinalGrades = useAddFinalGrades(courseId);
  const getGrades = useGetGrades(courseId);
  const course = useGetCourse(courseId);

  const [showCalculateDialog, setShowCalculateDialog] =
    useState<boolean>(false);
  const [showSisuDialog, setShowSisuDialog] = useState<boolean>(false);
  const [missingFinalGrades, setMissingFinalGrades] = useState<boolean>(false);

  const [uploadOpen, setUploadOpen] = useState<boolean>(false);

  // Filter out archived models
  const gradingModels = useMemo(
    () =>
      allGradingModels.data !== undefined
        ? allGradingModels.data.filter(model => !model.archived)
        : undefined,
    [allGradingModels.data]
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
    gradingModelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ): Promise<boolean> => {
    const model = gradingModels?.find(
      gradingModel => gradingModel.id === gradingModelId
    );
    if (model === undefined || course.data === undefined) return false;

    enqueueSnackbar('Calculating final grades...', {variant: 'info'});
    const finalGrades = batchCalculateGraph(
      model.graphStructure,
      selectedRows.map(selectedRow => ({
        userId: selectedRow.user.id,
        courseParts: selectedRow.courseParts.map(coursePart => ({
          coursePartId: coursePart.coursePartId,
          grade:
            findBestGrade(coursePart.grades, {gradeSelectOption})?.grade ?? 0, // TODO: Manage expired course parts
        })),
      }))
    );
    for (const grade of Object.values(finalGrades)) {
      const maxFinalGrade = getMaxFinalGrade(course.data.gradingScale);
      const Schema = z.number().int().min(0).max(maxFinalGrade);
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
        gradingModelId,
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
      {table.getSelectedRowModel().rows.length === 0 ? (
        <Box
          sx={{
            // mx: 1,
            p: 0.5,
            borderRadius: 3,
            display: 'flex',
            backgroundColor:
              table.getSelectedRowModel().rows.length === 0
                ? 'none'
                : theme.vars.palette.primary.light,
            width: '700px',
            // height: '45px',
          }}
        >
          <Button
            variant="tonal"
            onClick={() => setUploadOpen(true)}
            startIcon={<Add />}
            color="primary"
          >
            Add grades
          </Button>
        </Box>
      ) : (
        <Fade in={table.getSelectedRowModel().rows.length !== 0}>
          <Box
            sx={{
              // mx: 1,
              p: 0.5,
              borderRadius: 3,
              display: 'flex',
              backgroundColor:
                table.getSelectedRowModel().rows.length === 0
                  ? 'none'
                  : theme.vars.palette.primary.light,
              width: '700px',
              // height: '45px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                gap: 1,
                px: 1,
                // backgroundColor: theme.vars.palette.primary.light,
                // border: '1px solid black',
                borderRadius: 200,
              }}
            >
              <div style={{alignContent: 'center'}}>
                {table.getSelectedRowModel().rows.length} selected student
                {table.getSelectedRowModel().rows.length > 1 && 's'}
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
                      id="calculate-final-grades"
                    >
                      {missingFinalGrades
                        ? 'Calculate final grades'
                        : 'Re-calculate final grades'}
                    </Button>
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
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      )}
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
        {(gradingModels?.length ?? 0) > 1 && (
          <Tooltip
            title="Show only course parts used in the model"
            placement="top"
            disableInteractive
          >
            <AssesmentFilterButton />
          </Tooltip>
        )}

        {/* <Chip variant="outlined" label="Filters" /> */}

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
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          Showing: {table.getFilteredRowModel().rows.length} rows
          <Fade
            in={
              getErrorCount(
                table.getFilteredRowModel().rows.map(e => e.original),
                selectedGradingModel
              ) > 0
            }
          >
            <Button
              sx={{
                background: theme.vars.palette.Alert.errorStandardBg,
                color: theme.vars.palette.error.main,
                // fontWeight: theme.vars.typography.fontWeightBold,
                fontWeight: '500',
                p: 0.5,
                px: 2,
                py: 0.5,
                borderRadius: 3,
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                height: '36px',
                boxSizing: 'border-box',
                border:
                  table.getColumn('errors')?.getFilterValue() === 'errorsFilter'
                    ? `1px solid ${theme.vars.palette.error.main}`
                    : 'none',
              }}
              onClick={() => {
                if (
                  // table.getVisibleFlatColumns().find(c => c.id === 'errors')
                  table.getColumn('errors')?.getFilterValue() === 'errorsFilter'
                ) {
                  // table.setColumnVisibility({errors: false});
                  table.getColumn('errors')?.setFilterValue('');
                } else {
                  // table.setColumnVisibility({errors: true});
                  table.getColumn('errors')?.setFilterValue('errorsFilter');
                }
              }}
            >
              {getErrorCount(
                table.getFilteredRowModel().rows.map(e => e.original),
                selectedGradingModel
              )}
              {' errors'}
            </Button>
          </Fade>
        </Box>
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
