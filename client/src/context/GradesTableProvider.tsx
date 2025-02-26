// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable no-restricted-imports */

import {Badge, Checkbox} from '@mui/material';
import {
  type ExpandedState,
  type GroupingState,
  type RowData,
  type SortingState,
  type VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
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

import {
  type CourseTaskData,
  type FinalGradeData,
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
import {
  useGetAllGradingModels,
  useGetCourse,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';
import {
  findBestFinalGrade,
  findBestGrade,
  getCoursePartExpiryDate,
  getRowErrors,
  groupByLatestBestGrade,
  predictGrades,
} from '@/utils';

// Define the shape of the context
export type TableContextProps = {
  table: ReturnType<typeof useReactTable<GroupedStudentRow>>;
  gradeSelectOption: 'best' | 'latest';
  setGradeSelectOption: Dispatch<SetStateAction<'best' | 'latest'>>;
  selectedGradingModel: GradingModelData | 'any';
  setSelectedGradingModel: Dispatch<SetStateAction<GradingModelData | 'any'>>;
};
// Create the context
export const GradesTableContext = createContext<TableContextProps | null>(null);

// Table creation
declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    PrettyChipPosition: 'first' | 'middle' | 'last' | 'alone';
    coursePart?: boolean;
  }
}

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
  [key: number]: {courseParts: {[key: string]: number}; finalGrade: number};
};
export type ExtendedStudentRow = StudentRow & {
  predictedGraphValues?: PredictedGraphValues;
  errors?: RowError[];
};

export type GroupedStudentRow = ExtendedStudentRow & {
  latestBestGrade: string;
};

/**
 * Finds a previous grade that has been exported to Sisu, excluding the best
 * grade.
 *
 * @returns The previous grade that has been exported to Sisu, or null if not
 *   found.
 */
const findPreviouslyExportedToSisu = (
  bestGrade: FinalGradeData,
  row: StudentRow
): FinalGradeData | null => {
  for (const fg of row.finalGrades) {
    if (bestGrade.id === fg.id) continue; // Skip the best grade
    if (fg.sisuExportDate === null) continue; // And those not exported to sisu

    if (bestGrade.sisuExportDate !== null) {
      // If the best grade is also exported, we need to check which one is newer
      if (bestGrade.sisuExportDate < fg.sisuExportDate) return fg;
    } else {
      return fg;
    }
  }
  return null;
};

const columnHelper = createColumnHelper<GroupedStudentRow>();

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

  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    errors: false,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [userGraphOpen, setUserGraphOpen] = useState<boolean>(false);
  const [userGraphData, setUserGraphData] = useState<{
    row: GroupedStudentRow;
    gradingModel: GradingModelData | null;
  } | null>(null);

  const [gradeSelectOption, setGradeSelectOption] = useState<'best' | 'latest'>(
    'best'
  );
  const [selectedGradingModel, setSelectedGradingModel] = useState<
    GradingModelData | 'any'
  >('any');

  const finalGradeModelSelected =
    selectedGradingModel === 'any' ||
    selectedGradingModel.coursePartId === null;

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
        data.map(row => ({
          userId: row.user.id,
          courseTasks: row.courseTasks
            .filter(task => task.grades.length > 0)
            .map(task => ({
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
            })),
        }))
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

    // Add all auxiliary columns to the data
    return groupByLatestBestGrade(
      // Creating the extended rows
      data.map(row => {
        const studentPredictedGrades = Object.fromEntries(
          Object.entries(predictedGrades).map(([key, value]) => [
            key,
            value[row.user.id],
          ])
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
  ]);

  // --- Selection column ---
  const selectionColumn = columnHelper.display({
    id: 'select',
    size: 70,
    meta: {PrettyChipPosition: grouping.length > 0 ? 'last' : 'alone'},
    header: ({table}) => (
      <>
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
        <span style={{marginLeft: '4px', marginRight: '15px'}}>
          <Badge
            badgeContent={table.getSelectedRowModel().rows.length || '0'}
            color="primary"
            max={999}
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
            onChange={() => {
              if (row.getIsSomeSelected()) {
                // If some rows are selected, select all
                row.subRows.forEach(subRow => {
                  if (!subRow.getIsSelected())
                    subRow.getToggleSelectedHandler()(subRow);
                });
              } else {
                // All rows are selected, deselect all (and vice versa)
                row.subRows.forEach(subRow =>
                  subRow.getToggleSelectedHandler()(subRow)
                );
              }
            }}
          />
          <span style={{marginLeft: '4px', marginRight: '15px'}}>
            <Badge
              badgeContent={
                row.subRows.filter(subRow => subRow.getIsSelected()).length ||
                undefined
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
            height: '113%',
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
    sortingFn: (rowA, rowB, colId) => {
      if (predictedModelId === 'any') return 0; // Makes no sense to sort if there is more than one model

      const valA = rowA.getValue<GroupedStudentRow>(colId);
      const valB = rowB.getValue<GroupedStudentRow>(colId);
      const a = valA.predictedGraphValues?.[predictedModelId].finalGrade ?? -1;
      const b = valB.predictedGraphValues?.[predictedModelId].finalGrade ?? -1;

      return a - b;
    },
    cell: ({getValue}) => (
      <PredictedGradeCell
        row={getValue()}
        gradingModelIds={
          selectedGradingModel === 'any'
            ? (finalGradeModels?.map(model => model.id) ?? [])
            : [selectedGradingModel.id]
        }
        onClick={() => {
          if (finalGradeModels === undefined || finalGradeModels.length === 0)
            return;
          setUserGraphData({row: getValue(), gradingModel: null});
          setUserGraphOpen(true);
        }}
        gradingScale={course.data?.gradingScale ?? GradingScale.Numerical}
      />
    ),
    aggregatedCell: () => null,
  });

  // --- Model specific columns ---
  let modelColumns = [];
  if (finalGradeModelSelected) {
    modelColumns = [
      // Final grade column
      columnHelper.accessor(row => row.finalGrades, {
        header: t('general.final-grade'),
        id: 'finalGrade',
        getGroupingValue: row => findBestFinalGrade(row.finalGrades)?.grade,
        sortingFn: (a, b) =>
          (findBestFinalGrade(a.original.finalGrades)?.grade ?? -1) -
          (findBestFinalGrade(b.original.finalGrades)?.grade ?? -1),
        cell: ({getValue, row}) => (
          <FinalGradeCell
            userId={row.original.user.id}
            studentNumber={row.original.user.studentNumber}
            finalGrades={getValue()}
            gradingScale={course.data?.gradingScale ?? GradingScale.Numerical}
          />
        ),
      }),

      // Predicted grade column
      predictedGradeColumn,

      // Exported to Sisu column
      columnHelper.accessor(
        row => {
          // ATTENTION this function needs to have the same parameters of the one inside the grade cell
          // Clearly can be done in a better way
          const bestFinalGrade = findBestFinalGrade(row.finalGrades);
          if (!bestFinalGrade) return '-';
          if (bestFinalGrade.sisuExportDate) return '✅';
          if (findPreviouslyExportedToSisu(bestFinalGrade, row)) return '⚠️';
          return '-';
        },
        {
          header: t('course.results.table.exported'),
          meta: {PrettyChipPosition: 'last'},
          cell: ({getValue}) => getValue(),
          aggregatedCell: () => null,
        }
      ),
    ];
  } else {
    modelColumns = [
      // Dynamic course part grade
      columnHelper.accessor(row => row, {
        header: t('general.course-part-grade'),
        id: 'coursePartGrade',
        sortingFn: (rowA, rowB) => {
          const partId = selectedGradingModel.coursePartId!;
          const a = coursePartValues[rowA.original.user.id][partId] ?? -1;
          const b = coursePartValues[rowB.original.user.id][partId] ?? -1;
          return a - b;
        },
        getGroupingValue: row => findBestFinalGrade(row.finalGrades)?.grade,
        cell: ({getValue}) => (
          <PredictedGradeCell
            row={getValue()}
            gradingModelIds={[selectedGradingModel.id]}
            onClick={() => {
              setUserGraphData({
                row: getValue(),
                gradingModel: selectedGradingModel,
              });
              setUserGraphOpen(true);
            }}
            value={
              coursePartValues[getValue().user.id][
                selectedGradingModel.coursePartId!
              ]
            }
          />
        ),
      }),
    ];
  }

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
            sortingFn: (rowA, rowB, colId) => {
              const a = rowA.getValue<GradeCellSourceValue>(colId);
              const b = rowB.getValue<GradeCellSourceValue>(colId);
              if (a.type === 'coursePart' && b.type === 'coursePart')
                return (a.grade ?? -1) - (b.grade ?? -1);
              else if (a.type === 'courseTask' && b.type === 'courseTask') {
                return (
                  (findBestGrade(
                    a.task.grades,
                    getCoursePartExpiryDateFromTaskId(a.task.courseTaskId)
                  )?.grade ?? -1) -
                  (findBestGrade(
                    b.task.grades,
                    getCoursePartExpiryDateFromTaskId(b.task.courseTaskId)
                  )?.grade ?? -1)
                );
              }
              return 0; // Shouldn't happen
            },
            size: 80,
            cell: ({getValue, row}) => (
              <GradeCell
                studentUser={row.original.user}
                sourceValue={getValue()}
              />
            ),
            footer: source.name,
          }
        )
      ),
    [
      coursePartValues,
      finalGradeModelSelected,
      selectedModelSources,
      getCoursePartExpiryDateFromTaskId,
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
          return t('course.results.table.latest-grade') as string; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
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
      filterFn: row => {
        // Not sure which solution is the best one, for now we keep both
        // return getErrorCount([row.original], selectedGradingModel) > 0;
        return (row.original.errors?.length ?? 0) > 0;
      },
    }),
    columnHelper.accessor('user.studentNumber', {
      header: t('general.student-number'),
      meta: {PrettyChipPosition: 'first'},
    }),
    ...modelColumns,
    ...sourceColumns,
  ];

  const table = useReactTable({
    data: groupedData,
    columns,
    defaultColumn: {size: 100},
    getCoreRowModel: getCoreRowModel(),
    // Selection
    onRowSelectionChange: selection => {
      setRowSelection(selection);
      table.options.state.rowSelection = rowSelection;
    },
    enableRowSelection: true,
    // Grouping / Expanding
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    enableGrouping: true,
    enableSorting: true,
    autoResetExpanded: false,
    state: {
      columnVisibility,
      rowSelection,
      expanded,
      grouping,
      sorting,
    },

    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
