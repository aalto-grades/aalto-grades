// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Badge, Checkbox} from '@mui/material';
import {
  ExpandedState,
  GroupingState,
  RowData,
  SortingState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Dispatch,
  JSX,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {useParams} from 'react-router-dom';

import {
  CoursePartData,
  FinalGradeData,
  GradingScale,
  StudentRow,
} from '@/common/types';
import FinalGradeCell from '../components/course-results-view/FinalGradeCell';
import GradeCell from '../components/course-results-view/GradeCell';
import PredictedGradeCell from '../components/course-results-view/PredictedGradeCell';
import UserGraphDialog from '../components/course-results-view/UserGraphDialog';
import PrettyChip from '../components/shared/PrettyChip';
import {
  useGetAllGradingModels,
  useGetCourse,
  useGetCourseParts,
} from '../hooks/useApi';
import {findBestFinalGrade} from '../utils';
import {groupByLatestBestGrade, predictGrades} from '../utils/table';

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

type PropsType = PropsWithChildren & {
  data: StudentRow[];
};

// // TABLE CREATION
declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    PrettyChipPosition: 'first' | 'middle' | 'last' | 'alone';
    attainment?: boolean;
  }
}

export type GroupedStudentRow = {
  latestBestGrade: string;
} & ExtendedStudentRow;

export type ExtendedStudentRow = StudentRow & {
  predictedFinalGrades?: {[key: number]: {finalGrade: number}};
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
  if (row.finalGrades === undefined) return null;

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

// Create a provider component
export const GradesTableProvider = (props: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};

  const course = useGetCourse(courseId);
  const courseParts = useGetCourseParts(courseId);
  const allGradingModels = useGetAllGradingModels(courseId);

  const [_isPending, startTransition] = useTransition();
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [grouping, setGrouping] = useState<GroupingState>([]);
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

  // Row are always grouped, toggling grouping just add the grouping column to the table
  const groupedData = useMemo(() => {
    let predictedGrades: ReturnType<typeof predictGrades> = [];
    if (gradingModels) {
      startTransition(() => {
        predictedGrades = predictGrades(
          props.data,
          gradingModels,
          gradeSelectOption
        );
        console.log(predictedGrades);
      });
    }

    return groupByLatestBestGrade(
      props.data.map(row => ({
        ...row,
        // keep the same structure of predictedGrades but only show result for the student
        predictedFinalGrades: Object.fromEntries(
          Object.entries(predictedGrades).map(([key, value]) => [
            key,
            value[row.user.id],
          ])
        ),
      })),
      gradeSelectOption
    );
  }, [gradingModels, props.data, gradeSelectOption]);

  // const [globalFilter, setGlobalFilter] = useState('');

  //   useEffect(() => {
  //     props.setSelectedStudents(_ => {
  //       return table?.getSelectedRowModel().rows.map(row => {
  //         // Setting selectedStudnets
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

      const coursePartIds = gradingModel.graphStructure.nodes
        .filter(node => node.id.startsWith('coursepart'))
        .map(node => parseInt(node.id.split('-')[1]));

      return courseParts.data.filter(coursePart =>
        coursePartIds.includes(coursePart.id)
      );
    },
    [gradingModels, courseParts.data]
  );

  // Creating Grades columns
  const gradeColumns = useMemo(() => {
    const selectedCourseParts =
      getCoursePartsForGradingModel(selectedGradingModel);

    return selectedCourseParts.map(coursePart =>
      columnHelper.accessor(
        row =>
          row.courseParts.find(
            rowCoursePart => rowCoursePart.coursePartId === coursePart.id
          ),
        {
          header: att.name,
          meta: {PrettyChipPosition: 'alone', attainment: true},
          enableSorting: false,
          size: 80,
          cell: ({getValue, row}) => (
            <GradeCell
              studentNumber={row.original.user.studentNumber ?? 'N/A'}
              coursePartResults={getValue()}
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
    // TODO: SHOULD USE THE VISIBILITY API
    [
      columnHelper.accessor(row => row.latestBestGrade, {
        id: 'latestBestGrade',
        meta: {PrettyChipPosition: 'first'},
        header: () => {
          return 'Latest Part Date';
        },
        cell: prop => prop.getValue(),
      }),
    ].filter(column => grouping.includes(column.id ?? ''));

  // Creating static columns
  const staticColumns = [
    ...groupingColumns,
    // Selection Column
    columnHelper.display({
      id: 'select',
      size: 70,
      meta: {PrettyChipPosition: grouping.length > 0 ? 'last' : 'alone'},
      header: ({table}) => {
        return (
          <>
            <Checkbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
                id: 'select-all',
              }}
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
        );
      },
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
                  row.subRows.map(subRow => {
                    !subRow.getIsSelected() &&
                      subRow.getToggleSelectedHandler()(subRow);
                  });
                } else {
                  // All rows are selected, deselect all (and viceversa)
                  row.subRows.map(subRow =>
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
    columnHelper.accessor('user.studentNumber', {
      header: 'Student Number',
      meta: {PrettyChipPosition: 'first'},
      // cell: ({row, getValue}) => {
      //   // TODO: Remove link
      //   return getValue();
      // },
    }),
    // columnHelper.accessor('credits', {
    //   header: 'Credits',
    //   enableSorting: false,
    //   cell: info => info.getValue(),
    //   aggregatedCell: () => null,
    // }),
    columnHelper.accessor(row => row.finalGrades ?? [], {
      header: 'Final Grade',
      id: 'finalGrade',
      enableSorting: false,
      getGroupingValue: row => findBestFinalGrade(row.finalGrades ?? [])?.grade,
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
      header: 'Grade preview',
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
        const bestFinalGrade = findBestFinalGrade(row.finalGrades ?? []);
        if (!bestFinalGrade) return '-';
        if (bestFinalGrade.sisuExportDate) return '✅';
        if (findPreviouslyExportedToSisu(bestFinalGrade, row)) return '⚠️';
        return '-';
      },

      {
        header: 'Exported to Sisu',
        meta: {PrettyChipPosition: 'last'},
        cell: info => info.getValue(),
        aggregatedCell: () => null,
      }
    ),
    // columnHelper.group({
    //   header: 'Attainments',
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
    enableGrouping: true,
    enableSorting: true,
    autoResetExpanded: false,
    state: {
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
  return (
    <GradesTableContext.Provider
      value={{
        table,
        gradeSelectOption,
        setGradeSelectOption,
        selectedGradingModel: selectedGradingModel,
        setSelectedGradingModel: setSelectedGradingModel,
      }}
    >
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
      {props.children}
    </GradesTableContext.Provider>
  );
};
