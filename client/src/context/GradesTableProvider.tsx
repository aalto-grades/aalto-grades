// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
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
  type CoursePartData,
  type FinalGradeData,
  GradingScale,
  type StudentRow,
} from '@/common/types';
import UserGraphDialog from '@/components/course/course-results-view/UserGraphDialog';
import FinalGradeCell from '@/components/course/course-results-view/table/FinalGradeCell';
import GradeCell from '@/components/course/course-results-view/table/GradeCell';
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
  getRowErrors,
  groupByLatestBestGrade,
  predictGrades,
} from '@/utils';

// Define the shape of the context
export type TableContextProps = {
  table: ReturnType<typeof useReactTable<GroupedStudentRow>>;
  //   setTable: Dispatch<SetStateAction<typeof table>;
  gradeSelectOption: 'best' | 'latest';
  setGradeSelectOption: Dispatch<SetStateAction<'best' | 'latest'>>;
  selectedGradingModel: 'any' | number;
  setSelectedGradingModel: Dispatch<SetStateAction<'any' | number>>;
};
// Create the context
export const GradesTableContext = createContext<TableContextProps | undefined>(
  undefined
);

// Table creation
declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    PrettyChipPosition: 'first' | 'middle' | 'last' | 'alone';
    coursePart?: boolean;
  }
}

export type GroupedStudentRow = {
  latestBestGrade: string;
} & ExtendedStudentRow;

export type RowError =
  | {
      type: 'Error';
      message: string;
      info: {
        columnId: string;
      };
    }
  | {
      type: 'InvalidGrade';
      message: string;
      info: {columnId: string};
    }
  | {
      type: 'InvalidPredictedGrade' | 'OutOfRangePredictedGrade';
      message: string;
      info: {
        columnId: string;
        modelId: string;
      };
    };
export type RowErrorType = RowError['type'];

export type ExtendedStudentRow = StudentRow & {
  predictedFinalGrades?: {[key: number]: {finalGrade: number}};
  errors?: RowError[];
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
    if (bestGrade.finalGradeId === fg.finalGradeId) continue; // Skip the best grade
    if (fg.sisuExportDate === null) continue; // and those not exported to sisu

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

type PropsType = PropsWithChildren & {data: StudentRow[]};
export const GradesTableProvider = ({
  data,
  children,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};

  const course = useGetCourse(courseId);
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const allGradingModels = useGetAllGradingModels(courseId);

  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    errors: false,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [userGraphOpen, setUserGraphOpen] = useState<boolean>(false);
  const [userGraphData, setUserGraphData] = useState<GroupedStudentRow | null>(
    null
  );

  const [gradeSelectOption, setGradeSelectOption] = useState<'best' | 'latest'>(
    'best'
  );
  const [selectedGradingModel, setSelectedGradingModel] = useState<
    'any' | number
  >('any');

  // Filter out archived models
  const gradingModels = useMemo(
    () =>
      allGradingModels.data !== undefined
        ? allGradingModels.data.filter(model => !model.archived)
        : undefined,
    [allGradingModels.data]
  );

  // Some grouping options require infering data not readily available so we create these columns in advance here
  // TanTable groups by value of the column, so we toggle on the column if the grouping is required
  const groupedData = useMemo(() => {
    // Here we predict the grades for the students
    let predictedGrades: ReturnType<typeof predictGrades> = [];
    if (gradingModels) {
      predictedGrades = predictGrades(data, gradingModels, gradeSelectOption);
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
          // keep the same structure of predictedGrades but only show result for the student
          predictedFinalGrades: studentPredictedGrades,
          errors: getRowErrors(
            t,
            row,
            courseTasks.data ?? [],
            studentPredictedGrades,
            course.data?.gradingScale ?? GradingScale.Numerical
          ),
        };
      }),
      gradeSelectOption
    );
  }, [
    t,
    gradingModels,
    data,
    gradeSelectOption,
    courseTasks.data,
    course.data?.gradingScale,
  ]);

  // const [globalFilter, setGlobalFilter] = useState('');

  //   useEffect(() => {
  //     props.setSelectedStudents(_ => {
  //       return table?.getSelectedRowModel().rows.map(row => {
  //         // Setting selectedStudents
  //         return row.original;
  //       });
  //     });
  //   }, [rowSelection]);

  // console.log(expanded);
  // console.log(rowSelection);

  const getCoursePartsForGradingModel = useCallback(
    (modelId: number | 'any'): CoursePartData[] => {
      if (modelId === 'any') return courseParts.data ?? [];
      if (gradingModels === undefined || courseParts.data === undefined)
        return [];

      const gradingModel = gradingModels.find(model => model.id === modelId);
      if (gradingModel === undefined) return [];

      const coursePartIds = new Set(
        gradingModel.graphStructure.nodes
          .filter(node => node.id.startsWith('coursepart'))
          .map(node => parseInt(node.id.split('-')[1]))
      );

      return courseParts.data.filter(coursePart =>
        coursePartIds.has(coursePart.id)
      );
    },
    [gradingModels, courseParts.data]
  );

  // Creating grades columns
  const gradeColumns = useMemo(() => {
    const selectedCourseParts =
      getCoursePartsForGradingModel(selectedGradingModel);

    return selectedCourseParts.map(coursePart =>
      columnHelper.accessor(
        row =>
          row.courseTasks.find(
            rowCourseTask => rowCourseTask.courseTaskId === coursePart.id // TODO: Broken.
          ),
        {
          header: coursePart.name,
          meta: {PrettyChipPosition: 'alone', coursePart: true},
          enableSorting: false,
          size: 80,
          cell: ({getValue, row}) => (
            <GradeCell
              studentNumber={row.original.user.studentNumber ?? 'N/A'}
              coursePartResults={getValue()}
              maxGrade={/* coursePart.maxGrade */ null}
            />
          ),
          footer: coursePart.name,
        }
      )
    );
  }, [getCoursePartsForGradingModel, selectedGradingModel]);

  // This columns are used to group by data that is not directly shown
  // For example calculating the latest attainment date
  // For example grouping by Exported to sisu has no need to create a column
  const groupingColumns =
    // TODO: Should use the visibility API
    [
      columnHelper.accessor(row => row.latestBestGrade, {
        id: 'latestBestGrade',
        meta: {PrettyChipPosition: 'first'},
        header: () => {
          return t('course.results.table.latest-grade') as string; // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
        },
        cell: prop => prop.getValue(),
      }),
    ].filter(column => grouping.includes(column.id ?? ''));

  // Creating static columns
  const staticColumns = [
    ...groupingColumns,
    // Selection column
    columnHelper.display({
      id: 'select',
      size: 70,
      meta: {PrettyChipPosition: grouping.length > 0 ? 'last' : 'alone'},
      header: ({table}) => (
        <>
          <Checkbox
            id="select-all"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
          <span style={{marginLeft: '4px', marginRight: '15px'}}>
            <Badge
              badgeContent={table.getSelectedRowModel().rows.length || '0'}
              // color="secondary"
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
              id="select-checkbox"
              checked={row.getIsAllSubRowsSelected()}
              indeterminate={row.getIsSomeSelected()}
              // onChange={row.getToggleSelectedHandler()}
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
          id={`select-checkbox-${row.id}`}
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
              // border: '1px solid black',
              borderBlockEnd: '1px solid lightgray',
              borderLeft: '1px solid lightgray',
              borderEndStartRadius: '10px',
              // backgroundColor: 'black',
              position: 'absolute',
              left: '0px',
              bottom: '50%',
              zIndex: -1,
              pointerEvents: 'none',
            },
          }}
        />
      ),
    }),
    columnHelper.accessor(row => row.errors, {
      header: t('course.results.table.errors'),
      id: 'errors',
      enableHiding: true,
      // The column only filter, for other type of filtering write another filterFn
      filterFn: row => {
        // Not sure which solution is the best one, for now i keep both
        // return getErrorCount([row.original], selectedGradingModel) > 0;
        return (row.original.errors?.length ?? 0) > 0;
      },
    }),
    columnHelper.accessor('user.studentNumber', {
      header: t('general.student-number'),
      meta: {PrettyChipPosition: 'first'},
    }),
    columnHelper.accessor(row => row.finalGrades, {
      header: t('general.final-grade'),
      id: 'finalGrade',
      enableSorting: false,
      getGroupingValue: row => findBestFinalGrade(row.finalGrades)?.grade,
      cell: ({getValue, row}) => (
        <FinalGradeCell
          userId={row.original.user.id}
          studentNumber={row.original.user.studentNumber ?? 'N/A'}
          finalGrades={getValue()}
          gradingScale={course.data?.gradingScale ?? GradingScale.Numerical}
        />
      ),
    }),
    columnHelper.accessor(row => row, {
      header: t('course.results.table.preview'),
      meta: {PrettyChipPosition: 'middle'},
      sortingFn: (a, b, columnId) => {
        const modelId =
          selectedGradingModel !== 'any'
            ? selectedGradingModel
            : gradingModels?.length === 1
              ? gradingModels[0].id
              : 'any';
        if (modelId === 'any') return 0; // Makes no sense to sort if there is more than one model

        const valA =
          a.getValue<GroupedStudentRow>(columnId).predictedFinalGrades?.[
            modelId
          ].finalGrade;
        const valB =
          b.getValue<GroupedStudentRow>(columnId).predictedFinalGrades?.[
            modelId
          ].finalGrade;

        if (valB === undefined) return 1;
        if (valA === undefined) return -1;

        if (valA < valB) return -1;
        if (valA > valB) return 1;

        return 0;
      },
      cell: info => (
        <PredictedGradeCell
          row={info.getValue()}
          gradingModelIds={
            selectedGradingModel === 'any'
              ? gradingModels?.map(model => model.id)
              : [selectedGradingModel]
          }
          onClick={() => {
            if (gradingModels === undefined || gradingModels.length === 0)
              return;
            setUserGraphData(info.getValue());
            setUserGraphOpen(true);
          }}
          gradingScale={course.data?.gradingScale ?? GradingScale.Numerical}
        />
      ),
      aggregatedCell: () => null,
    }),
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
        cell: info => info.getValue(),
        aggregatedCell: () => null,
      }
    ),
    // columnHelper.group({
    //   header: 'Course parts',
    //   meta: {PrettyChipPosition: 'alone'},
    //   columns: gradeColumns,
    // }),
    ...gradeColumns,
  ];

  const table = useReactTable({
    data: groupedData,
    columns: [...staticColumns],
    defaultColumn: {
      size: 100,
    },
    getCoreRowModel: getCoreRowModel(),
    // Selection
    onRowSelectionChange: selection => {
      setRowSelection(selection);
      table.options.state.rowSelection = rowSelection;
    },
    // enableRowSelection: row => {
    //   if (row.subRows && row.subRows.length > 0) {
    //     return false;
    //   }
    //   return true;
    // },
    enableRowSelection: true,
    // onRowSelectionChange: setRowSelection,
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
    // getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // debugAll: true,
  });

  const providerData = useMemo(
    () => ({
      table,
      gradeSelectOption,
      setGradeSelectOption,
      selectedGradingModel,
      setSelectedGradingModel,
    }),
    [gradeSelectOption, selectedGradingModel, table]
  );

  return (
    <GradesTableContext.Provider value={providerData}>
      <UserGraphDialog
        open={userGraphOpen}
        onClose={() => setUserGraphOpen(false)}
        gradingModels={[
          ...(gradingModels?.filter(
            model =>
              model.id === selectedGradingModel ||
              selectedGradingModel === 'any'
          ) ?? []),
          ...(gradingModels?.filter(
            model =>
              model.id !== selectedGradingModel &&
              selectedGradingModel !== 'any'
          ) ?? []),
        ]} // Very ugly way to sort the selected model to be the first
        row={userGraphData}
      />
      {children}
    </GradesTableContext.Provider>
  );
};
