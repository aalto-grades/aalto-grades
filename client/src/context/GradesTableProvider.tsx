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

import {AttainmentData, StudentRow} from '@/common/types';
import FinalGradeCell from '../components/course-results-view/FinalGradeCell';
import GradeCell from '../components/course-results-view/GradeCell';
import PredictedGradeCell from '../components/course-results-view/PredictedGradeCell';
import UserGraphDialog from '../components/course-results-view/UserGraphDialog';
import PrettyChip from '../components/shared/PrettyChip';
import {useGetAllAssessmentModels, useGetAttainments} from '../hooks/useApi';
import {groupByLatestBestGrade, predictGrades} from '../utils/table';

// Define the shape of the context
export type TableContextProps = {
  table: ReturnType<typeof useReactTable<GroupedStudentRow>>;
  //   setTable: Dispatch<SetStateAction<typeof table>;
  gradeSelectOption: 'best' | 'latest';
  setGradeSelectOption: Dispatch<SetStateAction<'best' | 'latest'>>;
  selectedAssessmentModel: 'any' | number;
  setSelectedAssessmentModel: Dispatch<SetStateAction<'any' | number>>;
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
  }
}

export type GroupedStudentRow = {
  grouping: string;
} & ExtendedStudentRow;

export type ExtendedStudentRow = StudentRow & {
  predictedFinalGrades?: {[key: number]: {finalGrade: string}};
};

const columnHelper = createColumnHelper<GroupedStudentRow>();

// Create a provider component
export const GradesTableProvider = (props: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const allAssessmentModels = useGetAllAssessmentModels(courseId);
  const attainments = useGetAttainments(courseId);
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
  const [selectedAssessmentModel, setSelectedAssessmentModel] = useState<
    'any' | number
  >('any');

  // Filter out archived models
  const assessmentModels = useMemo(
    () =>
      allAssessmentModels.data !== undefined
        ? allAssessmentModels.data.filter(model => !model.archived)
        : undefined,
    [allAssessmentModels.data]
  );

  // Row are always grouped, toggling grouping just add the grouping column to the table
  const groupedData = useMemo(() => {
    let predictedGrades: ReturnType<typeof predictGrades> = [];
    if (assessmentModels) {
      startTransition(() => {
        predictedGrades = predictGrades(
          props.data,
          assessmentModels,
          gradeSelectOption
        );
        console.log(predictedGrades);
      });
    }

    return groupByLatestBestGrade(
      props.data.map(row => {
        return {
          ...row,
          // keep the same structure of predictedGrades but only show result for the student
          predictedFinalGrades: Object.fromEntries(
            Object.entries(predictedGrades).map(([key, value]) => [
              key,
              value[row.user.id],
            ])
          ) as unknown as {[key: number]: {finalGrade: string}},
        };
      }),
      gradeSelectOption
    );
  }, [assessmentModels, props.data, gradeSelectOption]);

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

  const getAttainmentsForAssessmentModel = useCallback(
    (modelId: number | 'any'): AttainmentData[] => {
      if (modelId === 'any') return attainments.data ?? [];
      if (assessmentModels === undefined || attainments.data === undefined)
        return [];

      const assessmentModel = assessmentModels.find(
        model => model.id === modelId
      );
      if (assessmentModel === undefined) return [];

      const attainmentIds = assessmentModel.graphStructure.nodes
        .filter(node => node.id.startsWith('attainment'))
        .map(node => parseInt(node.id.split('-')[1]));

      return attainments.data.filter(attainment =>
        attainmentIds.includes(attainment.id)
      );
    },
    [assessmentModels, attainments.data]
  );

  // Creating Grades columns
  const gradeColumns = useMemo(() => {
    const selectedAttainments = getAttainmentsForAssessmentModel(
      selectedAssessmentModel
    );

    return selectedAttainments.map(att =>
      columnHelper.accessor(
        row => row.attainments.find(a => a.attainmentId === att.id),
        {
          header: att.name,
          meta: {PrettyChipPosition: 'alone'},
          enableSorting: false,
          size: 120,
          cell: ({getValue, row}) => (
            <GradeCell
              studentNumber={row.original.user.studentNumber ?? 'N/A'}
              attainemntResults={getValue()}
            />
          ),
          footer: att.name,
        }
      )
    );
  }, [getAttainmentsForAssessmentModel, selectedAssessmentModel]);

  const groupingColumns =
    grouping.length > 0
      ? [
          columnHelper.accessor(row => row.grouping, {
            id: 'grouping',
            meta: {PrettyChipPosition: 'first'},
            header: () => {
              return 'Latest Attainment';
            },
            cell: prop => prop.getValue(),
          }),
        ]
      : [];

  // Creating static columns
  const staticColumns = [
    ...groupingColumns,
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
      enableSorting: false,
      cell: ({getValue, row}) => (
        <FinalGradeCell
          userId={row.original.user.id}
          studentNumber={row.original.user.studentNumber ?? 'N/A'}
          finalGrades={getValue()}
        />
      ),
    }),
    columnHelper.accessor(row => row, {
      header: 'Grade preview',
      meta: {PrettyChipPosition: 'middle'},
      sortingFn: (a, b, columnId) => {
        const modelId =
          selectedAssessmentModel !== 'any'
            ? selectedAssessmentModel
            : assessmentModels?.length === 1
              ? assessmentModels[0].id
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
          assessmentModelIds={
            selectedAssessmentModel === 'any'
              ? assessmentModels?.map(model => model.id)
              : [selectedAssessmentModel]
          }
          onClick={() => {
            if (assessmentModels === undefined || assessmentModels.length === 0)
              return;
            setUserGraphData(info.getValue());
            setUserGraphOpen(true);
          }}
        />
      ),
      aggregatedCell: () => null,
    }),
    columnHelper.accessor(
      row => {
        // ATTENTION this function needs to have the same parameters of the one inside the grade cell
        // Clearly can be done in a better way
        // const bestGrade = findBestGrade(row?.finalGrades);
        const bestGrade = row.finalGrades?.[0];
        if (!bestGrade) return '-';
        // console.log(bestGrade);
        if (bestGrade.sisuExportDate) return '✅';
        // console.log(findPreviouslyExportedToSisu(bestGrade, row));
        // if (findPreviouslyExportedToSisu(bestGrade, row)) return '⚠️';
        return '-';
      },

      {
        header: 'Exported to Sisu',
        meta: {PrettyChipPosition: 'last'},
        cell: info => info.getValue(),
        aggregatedCell: () => null,
      }
    ),
    columnHelper.group({
      header: 'Attainments',
      meta: {PrettyChipPosition: 'alone'},
      columns: gradeColumns,
    }),
  ];

  const table = useReactTable({
    data: groupedData,
    columns: [...staticColumns],
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
    // getSubRows: (row: StudentRow) => row.subAttainments,
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
        selectedAssessmentModel,
        setSelectedAssessmentModel,
      }}
    >
      <UserGraphDialog
        open={userGraphOpen}
        onClose={() => setUserGraphOpen(false)}
        assessmentModels={[
          ...(assessmentModels?.filter(
            model =>
              model.id === selectedAssessmentModel ||
              selectedAssessmentModel === 'any'
          ) || []),
          ...(assessmentModels?.filter(
            model =>
              model.id !== selectedAssessmentModel &&
              selectedAssessmentModel !== 'any'
          ) || []),
        ]} // Very ugly way to sort the selected model to be the first
        row={userGraphData}
      />
      {props.children}
    </GradesTableContext.Provider>
  );
};
