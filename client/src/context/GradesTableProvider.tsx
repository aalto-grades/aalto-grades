// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Badge, Checkbox} from '@mui/material';
import {
  type ColumnFiltersState,
  type ExpandedState,
  type GroupingState,
  type SortingState,
  aggregationFn_sum,
  createColumnHelper,
  useTable,
} from '@tanstack/react-table';
import {
  type Dispatch,
  type JSX,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  type CourseTaskData,
  type GradingModelData,
  GradingScale,
  type StudentRow,
} from '@/common/types';
import {batchCalculateCourseParts} from '@/common/util';
import UserGraphDialog from '@/components/course/course-results-view/UserGraphDialog';
import FinalGradeCell from '@/components/course/course-results-view/table/FinalGradeCell';
import GradeCell, {
  type GradeCellSourceValue,
} from '@/components/course/course-results-view/table/GradeCell';
import PredictedGradeCell from '@/components/course/course-results-view/table/PredictedGradeCell';
import PrettyChip from '@/components/shared/PrettyChip';
import {features} from '@/components/shared/table/features';
import {usePersistedTableState} from '@/components/shared/table/usePersistedTableState';
import {
  useGetAllGradingModels,
  useGetCourse,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';
import {
  findBestFinalGrade,
  findBestGrade,
  findPreviouslyExportedToSisu,
  getCoursePartExpiryDate,
  getRowErrors,
  groupByLatestBestGrade,
  predictGrades
} from '@/utils';
import {checkStudentActiveGrades, getGradingModelSourceIds} from '@/utils/table';

// Define the shape of the context
export type TableContextProps = {
  table: ReturnType<typeof useTable<typeof features, GroupedStudentRow>>;
  gradeSelectOption: 'best' | 'latest';
  setGradeSelectOption: Dispatch<SetStateAction<'best' | 'latest'>>;
  selectedGradingModel: GradingModelData | 'any';
  setSelectedGradingModel: Dispatch<SetStateAction<GradingModelData | 'any'>>;
};
// Create the context
export const GradesTableContext = createContext<TableContextProps | null>(null);

export type RowError =
  | {
    type: 'Error';
    message: string;
    info: {columnId: string};
  }
  | {
    type: 'InvalidGrade';
    message: string;
    info: {columnId: string};
  }
  | {
    type: 'InvalidPredictedGrade' | 'OutOfRangePredictedGrade';
    message: string;
    info: {modelId: number};
  };
export type RowErrorType = RowError['type'];

export type PredictedGraphValues = {
  [key: number]: {courseParts?: {[key: string]: number}; finalGrade: number};
};
export type ActiveGradeInfo = {
  hasActiveGrade: boolean;
  activeTaskIds: number[];
};
export type ExtendedStudentRow = StudentRow & {
  predictedGraphValues?: PredictedGraphValues;
  errors?: RowError[];
  activeGradeInfo?: ActiveGradeInfo;
};

export type GroupedStudentRow = ExtendedStudentRow & {
  latestBestGrade: string;
};

const columnHelper = createColumnHelper<typeof features, GroupedStudentRow>();

// Schemas validating the persisted view state, so stale or corrupted storage
// (e.g. a deleted grading model) falls back to the defaults instead of
// breaking the table
const persistedStateSchemas = {
  expanded: z.union([z.boolean(), z.record(z.string(), z.boolean())]),
  grouping: z.array(z.string()),
  sorting: z.array(z.object({id: z.string(), desc: z.boolean()})),
  columnVisibility: z.record(z.string(), z.boolean()),
  columnFilters: z.array(z.object({id: z.string(), value: z.unknown()})),
  gradeSelectOption: z.union([z.literal('best'), z.literal('latest')]),
  gradingModelId: z.union([z.number(), z.literal('any')]),
};

type PropsType = {data: StudentRow[]} & PropsWithChildren;
export const GradesTableProvider = ({
  data,
  children,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};

  const course = useGetCourse(courseId);
  const allGradingModels = useGetAllGradingModels(courseId);
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);

  // View state persisted to localStorage (shared object per course) so
  // grouping, sorting, filters etc. survive a page refresh. Row selection and
  // the search box are intentionally not persisted: selections are transient
  // and search is already synced to the ?search= query parameter.
  const tableStateKey = `grades-table-state-${courseId}`;

  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = usePersistedTableState<ExpandedState>(
    tableStateKey,
    'expanded',
    {},
    (raw) => {
      const parsed = persistedStateSchemas.expanded.parse(raw);
      // The table always controls expansion with the object form
      return typeof parsed === 'boolean' ? {} : parsed;
    }
  );
  const [grouping, setGrouping] = usePersistedTableState<GroupingState>(
    tableStateKey,
    'grouping',
    [],
    raw => persistedStateSchemas.grouping.parse(raw)
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = usePersistedTableState<
    Record<string, boolean>
  >(
    tableStateKey,
    'columnVisibility',
    {errors: false, activeStudents: false, exportedToSisu: false},
    raw => persistedStateSchemas.columnVisibility.parse(raw)
  );
  const [columnFilters, setColumnFilters] =
    usePersistedTableState<ColumnFiltersState>(
      tableStateKey,
      'columnFilters',
      [],
      raw => persistedStateSchemas.columnFilters.parse(raw)
    );
  const [sorting, setSorting] = usePersistedTableState<SortingState>(
    tableStateKey,
    'sorting',
    [],
    raw => persistedStateSchemas.sorting.parse(raw)
  );
  const [userGraphOpen, setUserGraphOpen] = useState(false);
  const [userGraphData, setUserGraphData] = useState<{
    row: GroupedStudentRow;
    gradingModel: GradingModelData | null;
    // Id of the model shown first in the model selector, e.g. the grading
    // model of the course part the dialog was opened from
    firstModelId?: number;
  } | null>(null);

  const [gradeSelectOption, setGradeSelectOption] = usePersistedTableState<
  'best' | 'latest'
  >(tableStateKey, 'gradeSelectOption', 'best', raw =>
    persistedStateSchemas.gradeSelectOption.parse(raw)
  );
  // Only the model id is persisted, the model itself is resolved from the
  // loaded grading models so a deleted model falls back to 'any'
  const [selectedGradingModelId, setSelectedGradingModelId] =
    usePersistedTableState<number | 'any'>(
      tableStateKey,
      'gradingModelId',
      'any',
      raw => persistedStateSchemas.gradingModelId.parse(raw)
    );

  // Filter out archived models
  const gradingModels = useMemo(
    () =>
      allGradingModels.data !== undefined
        ? allGradingModels.data.filter(model => !model.archived)
        : undefined,
    [allGradingModels.data]
  );
  const finalGradeModels = gradingModels?.filter(
    model => model.coursePartId === null
  );

  const selectedGradingModel = useMemo<GradingModelData | 'any'>(() => {
    if (selectedGradingModelId === 'any') return 'any';
    // While models are loading or if the model was deleted, fall back to 'any'
    return gradingModels?.find(model => model.id === selectedGradingModelId) ?? 'any';
  }, [selectedGradingModelId, gradingModels]);

  const setSelectedGradingModel: Dispatch<
    SetStateAction<GradingModelData | 'any'>
  > = useCallback(
    (action) => {
      setSelectedGradingModelId((prevId) => {
        const prev =
          prevId === 'any'
            ? 'any'
            : gradingModels?.find(model => model.id === prevId) ?? 'any';
        const next =
          typeof action === 'function'
            ? (
                action
              )(prev)
            : action;
        return next === 'any' ? 'any' : next.id;
      });
    },
    [gradingModels, setSelectedGradingModelId]
  );

  // The exported to Sisu column is hidden by default, overriding any stale
  // value that may have been persisted to storage, unless it is being grouped
  // by, in which case the grouped value needs to be shown. Must stay
  // referentially stable, otherwise the table reports a visibility change on
  // every render and loops.
  const exportedToSisuGrouped = grouping.includes('exportedToSisu');
  const effectiveColumnVisibility = useMemo(
    () => ({...columnVisibility, exportedToSisu: exportedToSisuGrouped}),
    [columnVisibility, exportedToSisuGrouped]
  );

  const finalGradeModelSelected =
    selectedGradingModel === 'any'
    || selectedGradingModel.coursePartId === null;

  const getCoursePartExpiryDateFromTaskId = useCallback(
    (courseTaskId: number): Date | null | undefined => {
      return getCoursePartExpiryDate(
        courseParts.data,
        courseTasks.data,
        courseTaskId
      );
    },
    [courseParts.data, courseTasks.data]
  );
  const coursePartValues = useMemo(
    () =>
      batchCalculateCourseParts(
        allGradingModels.data ?? [],
        data.map((row) => {
          return {
            userId: row.user.id,
            courseTasks: row.courseTasks
              .filter(task => task.grades.length > 0)
              .flatMap((task) => {
                const grade = findBestGrade(
                  task.grades,
                  getCoursePartExpiryDateFromTaskId(task.courseTaskId),
                  {expiredOption: 'non_expired', gradeSelectOption}
                )?.grade;
                return (grade === undefined)
                  ? []
                  : [{
                      id: task.courseTaskId,
                      grade: findBestGrade(
                        task.grades,
                        getCoursePartExpiryDateFromTaskId(task.courseTaskId)
                      )
                        ? findBestGrade(
                          task.grades,
                          getCoursePartExpiryDateFromTaskId(task.courseTaskId)
                        )!.grade
                        : 0,
                    }];
              }),
          };
        })
      ),
    [allGradingModels.data, data, getCoursePartExpiryDateFromTaskId]
  );

  // Some grouping options require infering data not readily available so we create these columns in advance here
  // TanTable groups by value of the column, so we toggle on the column if the grouping is required
  const groupedData = useMemo(() => {
    // Here we predict the grades for the students
    let predictedGrades: ReturnType<typeof predictGrades> = {};
    if (gradingModels) {
      predictedGrades = predictGrades(
        data,
        gradingModels,
        gradeSelectOption,
        getCoursePartExpiryDateFromTaskId
      );
    }

    // Get source IDs for active grade checking
    const sourceIds = getGradingModelSourceIds(
      selectedGradingModel,
      allGradingModels.data ?? []
    );

    // Add all auxiliary columns to the data
    return groupByLatestBestGrade(
      // Creating the extended rows
      data.map((row) => {
        const studentPredictedGrades = Object.fromEntries(
          Object.entries(predictedGrades).map(([key, value]) => [
            key,
            value[row.user.id],
          ])
        );

        // Check for active grades using the utility function
        const activeGradeInfo = checkStudentActiveGrades(
          row,
          sourceIds,
          courseTasks.data ?? [],
          getCoursePartExpiryDateFromTaskId
        );

        return {
          ...row,
          // Keep the same structure of predictedGrades but only show result for the student
          predictedGraphValues: studentPredictedGrades,
          errors: getRowErrors(
            t,
            row,
            courseTasks.data ?? [],
            studentPredictedGrades,
            course.data?.gradingScale ?? GradingScale.Numerical
          ),
          activeGradeInfo,
        };
      }),
      gradeSelectOption,
      getCoursePartExpiryDateFromTaskId
    );
  }, [
    gradingModels,
    data,
    gradeSelectOption,
    getCoursePartExpiryDateFromTaskId,
    t,
    courseTasks.data,
    course.data?.gradingScale,
    selectedGradingModel,
    allGradingModels.data,
  ]);

  // --- Selection column ---
  const selectionColumn = columnHelper.display({
    id: 'select',
    size: 70,
    meta: {PrettyChipPosition: grouping.length > 0 ? 'last' : 'alone'},
    aggregationFn: aggregationFn_sum,
    header: ({table}) => (
      <>
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          sx={theme => ({
            ...(theme.palette.mode === 'dark' && {
              color: 'text.primary',
              '&.Mui-checked': {
                color: 'text.primary',
              },
              '&.MuiCheckbox-indeterminate': {
                color: 'text.primary',
              },
            }),
          })}
        />
        <span style={{marginLeft: '4px', marginRight: '15px'}}>
          <Badge
            badgeContent={table.getSelectedRowModel().rows.length || '0'}
            color="primary"
            max={999}
            sx={theme => ({
              ...(theme.palette.mode === 'dark' && {
                '& .MuiBadge-badge': {
                  backgroundColor: theme.palette.text.primary,
                  color: theme.palette.primary.main,
                },
              }),
            })}
          />
        </span>
      </>
    ),
    aggregatedCell: ({row}) => (
      <PrettyChip position="last">
        <>
          <Checkbox
            checked={row.getIsAllSubRowsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={(e) => {
              row.getToggleSelectedHandler({selectChildren: true})(e);
            }}
          />
          <span style={{marginLeft: '4px', marginRight: '15px'}}>
            <Badge
              badgeContent={
                row.subRows.filter(subRow => subRow.getIsSelected()).length
                || undefined
              }
              max={999}
              color="secondary"
              sx={{alignItems: 'end'}}
            />
          </span>
        </>
      </PrettyChip>
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        style={{
          marginLeft: '21px',
        }}
        sx={{
          '&::before': {
            content: '""',
            width: '11px',
            height: '60px',
            borderBlockEnd: '1px solid lightgray',
            borderLeft: '1px solid lightgray',
            borderEndStartRadius: '10px',
            position: 'absolute',
            left: '0px',
            bottom: '50%',
            zIndex: -1,
            pointerEvents: 'none',
          },
        }}
      />
    ),
  });

  // --- Predicted grade column ---
  const predictedModelId =
    selectedGradingModel !== 'any'
      ? selectedGradingModel.id
      : finalGradeModels?.length === 1
        ? finalGradeModels[0].id
        : 'any';
  const predictedGradeColumn = columnHelper.accessor(row => row, {
    header: t('course.results.table.preview'),
    meta: {PrettyChipPosition: 'middle'},
    enableSorting: predictedModelId !== 'any',
    sortFn: (rowA, rowB, colId) => {
      if (predictedModelId === 'any') return 0; // Makes no sense to sort if there is more than one model

      const valA = rowA.getValue<GroupedStudentRow>(colId);
      const valB = rowB.getValue<GroupedStudentRow>(colId);
      const a = valA.predictedGraphValues?.[predictedModelId]?.finalGrade ?? -1;
      const b = valB.predictedGraphValues?.[predictedModelId]?.finalGrade ?? -1;

      return a - b;
    },
    getGroupingValue: (row) => {
      if (predictedModelId === 'any') return null; // Grouping by predicted grade doesn't make sense if there is more than one model

      const value = row.predictedGraphValues?.[predictedModelId]?.finalGrade ?? null;
      return value !== undefined ? String(value) : null;
    },
    cell: info => (
      <PredictedGradeCell
        cell={info.cell}
        gradingModelIds={
          selectedGradingModel === 'any'
            ? (finalGradeModels?.map(model => model.id) ?? [])
            : [selectedGradingModel.id]
        }
        onClick={() => {
          if (finalGradeModels === undefined || finalGradeModels.length === 0)
            return;
          setUserGraphData({row: info.getValue(), gradingModel: null});
          setUserGraphOpen(true);
        }}
        gradingScale={course.data?.gradingScale ?? GradingScale.Numerical}
      />
    ),
  });

  // --- Model specific columns ---
  const modelColumns = finalGradeModelSelected
    ? [
        // Final grade column
        columnHelper.accessor(row => row.finalGrades, {
          header: t('general.final-grade'),
          id: 'finalGrade',
          getGroupingValue: row => findBestFinalGrade(row.finalGrades)?.grade,
          sortFn: (a, b) => (findBestFinalGrade(a.original.finalGrades)?.grade ?? -1)
            - (findBestFinalGrade(b.original.finalGrades)?.grade ?? -1),
          cell: info => (
            <FinalGradeCell
              cell={info.cell}
              gradingScale={course.data?.gradingScale ?? GradingScale.Numerical}
            />
          ),
        }),

        // Predicted grade column
        predictedGradeColumn,

        // Exported to Sisu column
        columnHelper.accessor(
          (row) => {
            // ATTENTION this function needs to have the same parameters of the one inside the grade cell
            // Clearly can be done in a better way
            const bestFinalGrade = findBestFinalGrade(row.finalGrades);
            if (!bestFinalGrade) return '-';
            if (bestFinalGrade.sisuExportDate) return '✅';
            if (findPreviouslyExportedToSisu(bestFinalGrade, row)) return '⚠️';
            return '-';
          },
          {
            id: 'exportedToSisu',
            header: t('course.results.table.exported'),
            meta: {PrettyChipPosition: 'last'},
            enableHiding: true,
            filterFn: (row, _columnId, filterValue) => {
              if (filterValue === 'hideExported') {
                // Hide rows that have at least one final grade exported to Sisu
                return !row.original.finalGrades.some(fg => fg.sisuExportDate !== null);
              }
              return true;
            },
            cell: info => info.getValue(),
          }
        ),
      ]
    : [
        // Dynamic course part grade
        columnHelper.accessor(row => row, {
          header: t('general.course-part-grade'),
          id: 'coursePartGrade',
          sortFn: (rowA, rowB) => {
            const partId = selectedGradingModel.coursePartId!;
            const a = coursePartValues[rowA.original.user.id][partId] ?? -1;
            const b = coursePartValues[rowB.original.user.id][partId] ?? -1;
            return a - b;
          },
          getGroupingValue: row => findBestFinalGrade(row.finalGrades)?.grade,
          cell: info => (
            <PredictedGradeCell
              cell={info.cell}
              gradingModelIds={[selectedGradingModel.id]}
              onClick={() => {
                setUserGraphData({
                  row: info.getValue(),
                  gradingModel: selectedGradingModel,
                });
                setUserGraphOpen(true);
              }}
              value={
                coursePartValues[info.getValue().user.id][
                  selectedGradingModel.coursePartId!
                ]
              }
            />
          ),
        }),
      ];

  // --- Source column sources ---
  const selectedModelSources = useMemo(() => {
    if (selectedGradingModel === 'any') return courseParts.data ?? [];
    if (courseParts.data === undefined || courseTasks.data === undefined)
      return [];

    const sourceIds = new Set(
      selectedGradingModel.graphStructure.nodes
        .filter(node => node.type === 'source')
        .map(node => parseInt(node.id.split('-')[1]))
    );

    if (selectedGradingModel.coursePartId !== null) {
      return courseTasks.data.filter(task => sourceIds.has(task.id));
    }
    return courseParts.data.filter(part => sourceIds.has(part.id));
  }, [courseParts.data, courseTasks.data, selectedGradingModel]);

  // --- Source columns ---
  const sourceColumns = useMemo(
    () =>
      selectedModelSources.map(source =>
        columnHelper.accessor(
          (row): GradeCellSourceValue => {
            if (finalGradeModelSelected) {
              return {
                type: 'coursePart',
                grade: coursePartValues[row.user.id][source.id],
              };
            }
            return {
              type: 'courseTask',
              task: row.courseTasks.find(
                rowCourseTask => rowCourseTask.courseTaskId === source.id
              )!,
              maxGrade: (source as CourseTaskData).maxGrade,
              coursePartExpiryDate: getCoursePartExpiryDateFromTaskId(
                source.id
              ),
            };
          },
          {
            header: source.name,
            meta: {PrettyChipPosition: 'alone', coursePart: true},
            getGroupingValue: (row) => {
              if (finalGradeModelSelected) {
                // case coursePart, one grade only
                return coursePartValues[row.user.id][source.id];
              }
              // case courseTask, multiple grades
              const task = row.courseTasks.find(
                rowCourseTask => rowCourseTask.courseTaskId === source.id
              )!;
              return findBestGrade(
                task.grades,
                getCoursePartExpiryDateFromTaskId(task.courseTaskId)
              )?.grade;
            },
            sortFn: (rowA, rowB, colId) => {
              const a = rowA.getValue<GradeCellSourceValue>(colId);
              const b = rowB.getValue<GradeCellSourceValue>(colId);
              if (a === undefined || b === undefined) return 0;
              if (a.type === 'coursePart' && b.type === 'coursePart')
                return (a.grade ?? -1) - (b.grade ?? -1);
              else if (a.type === 'courseTask' && b.type === 'courseTask') {
                return (
                  (findBestGrade(
                    a.task.grades,
                    getCoursePartExpiryDateFromTaskId(a.task.courseTaskId)
                  )?.grade ?? -1)
                  - (findBestGrade(
                    b.task.grades,
                    getCoursePartExpiryDateFromTaskId(b.task.courseTaskId)
                  )?.grade ?? -1)
                );
              }
              return 0; // Shouldn't happen
            },
            size: 80,
            cell: (info) => {
              // Course part cells get a button for viewing the grading model
              // graph, with the graph of this course part shown first
              const coursePartModelId = finalGradeModelSelected
                ? gradingModels?.find(model => model.coursePartId === source.id)
                  ?.id
                : undefined;
              return (
                <GradeCell
                  cell={info.cell}
                  onViewGraph={
                    coursePartModelId === undefined
                      ? undefined
                      : () => {
                          setUserGraphData({
                            row: info.row.original,
                            gradingModel: null,
                            firstModelId: coursePartModelId,
                          });
                          setUserGraphOpen(true);
                        }
                  }
                />
              );
            },
            footer: source.name,
          }
        )
      ),
    [
      coursePartValues,
      finalGradeModelSelected,
      selectedModelSources,
      getCoursePartExpiryDateFromTaskId,
      gradingModels,
    ]
  );

  // This columns are used to group by data that is not directly shown
  // For example calculating the latest attainment date
  // For example grouping by Exported to sisu has no need to create a column
  const groupingColumns =
    // TODO: Should use the visibility API (#888)
    [
      columnHelper.accessor(row => row.latestBestGrade, {
        id: 'latestBestGrade',
        meta: {PrettyChipPosition: 'first'},
        header: () => {
          return t('course.results.table.latest-grade');
        },
        cell: ({getValue}) => getValue(),
      }),
    ].filter(column => grouping.includes(column.id ?? ''));

  // Creating columns
  const columns = [
    ...groupingColumns,
    selectionColumn,
    // Used for filtering columns with errors
    columnHelper.accessor(row => row.errors, {
      header: t('course.results.table.errors'),
      id: 'errors',
      enableHiding: true,
      filterFn: (row, _columnId, filterValue) => {
        if (filterValue === 'errorsFilter') {
          return (row.original.errors?.length ?? 0) > 0;
        }
        return true;
      },
    }),
    // Used for filtering only active students (those with at least one non-expired grade)
    // Also displays the active task IDs for debugging/visibility
    columnHelper.accessor(row => row.activeGradeInfo, {
      header: t('course.results.table.active'),
      id: 'activeStudents',
      enableHiding: true,
      filterFn: (row, _columnId, filterValue) => {
        if (filterValue === 'activeOnly') {
          // Use the pre-calculated activeGradeInfo from the row
          return row.original.activeGradeInfo?.hasActiveGrade ?? false;
        }
        return true;
      },
      cell: (info) => {
        const activeTaskIds = info.getValue()?.activeTaskIds ?? [];
        return activeTaskIds.length > 0 ? activeTaskIds.join(', ') : '-';
      },
    }),
    columnHelper.accessor('user.studentNumber', {
      header: t('general.student-number'),
      meta: {PrettyChipPosition: 'first'},
      size: 100,
    }),
    columnHelper.accessor(row => row.user.name ?? '-', {
      header: t('general.name'),
      size: 120,
    }),
    ...modelColumns,
    ...sourceColumns,
  ] as ReturnType<typeof columnHelper.accessor>[];

  const table = useTable({
    features: features,
    data: groupedData,
    columns,
    defaultColumn: {size: 100},
    // Selection
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    // Grouping / Expanding
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    enableGrouping: true,
    enableSorting: true,
    autoResetExpanded: false,
    // Column Resizing
    columnResizeMode: 'onChange',
    // globalFilterFn: (row, columnId, filterValue) => {
    //   row.getAllCells().forEach((cell) => {
    //     console.log(cell.renderValue());
    //   });

    //   if (!filterValue) return false;
    //   return true;
    // },
    state: {
      columnVisibility: effectiveColumnVisibility,
      columnFilters,
      rowSelection,
      expanded,
      grouping,
      sorting,
      globalFilter,
    },
  });

  return (
    <GradesTableContext.Provider
      // Putting this value inside a useMemo is buggy
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        table,
        gradeSelectOption,
        setGradeSelectOption,
        selectedGradingModel,
        setSelectedGradingModel,
      }}
    >
      <UserGraphDialog
        open={userGraphOpen}
        onClose={() => setUserGraphOpen(false)}
        gradingModels={
          gradingModels === undefined
            ? null
            : [...gradingModels].sort((a, b) => {
                // Return the explicitly requested model first
                if (userGraphData?.firstModelId !== undefined) {
                  if (a.id === userGraphData.firstModelId) return -1;
                  if (b.id === userGraphData.firstModelId) return 1;
                }

                // Sort final grade models first
                if (a.coursePartId === null && b.coursePartId !== null)
                  return -1;
                if (a.coursePartId !== null && b.coursePartId === null)
                  return 1;

                // Return selected model first
                if (selectedGradingModel === 'any') return a.id - b.id;
                if (a.id === selectedGradingModel.id) return -1;
                if (b.id === selectedGradingModel.id) return 1;
                return a.id - b.id;
              })
        }
        coursePartValues={coursePartValues}
        data={userGraphData}
      />
      {children}
    </GradesTableContext.Provider>
  );
};
