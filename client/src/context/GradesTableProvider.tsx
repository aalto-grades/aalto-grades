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
  useContext,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {useParams} from 'react-router-dom';

import {AttainmentData, StudentRow} from '@common/types';
import GradeCell from '../components/course-results-view/GradeCell';
import PredictedGradeCell from '../components/course-results-view/PredictedGradeCell';
import UserGraphDialog from '../components/course-results-view/UserGraphDialog';
import PrettyChip from '../components/shared/PrettyChip';
import {useGetAllAssessmentModels, useGetAttainments} from '../hooks/useApi';
import {groupByLatestBestGrade, predictGrades} from '../utils/table';

// Define the shape of the context
type TableContextProps = {
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
  predictedFinalGrades?: (string | number)[];
};

const columnHelper = createColumnHelper<GroupedStudentRow>();

// Create a provider component
export const GradesTableProvider = (props: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const assessmentModels = useGetAllAssessmentModels(courseId);
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

  // Row are always grouped, toggling grouping just add the grouping column to the table
  const groupedData = useMemo(() => {
    let predictedGrades: ReturnType<typeof predictGrades> = [];
    if (assessmentModels.data) {
      startTransition(() => {
        predictedGrades = predictGrades(
          props.data,
          assessmentModels.data,
          gradeSelectOption
        );
      });
    }

    return groupByLatestBestGrade(
      props.data.map(row => {
        return {
          ...row,
          predictedFinalGrades:
            predictedGrades.length > 0
              ? predictedGrades.map(pg => pg[row.user.id].finalGrade)
              : ['No models'],
        };
      }),
      gradeSelectOption
    );
  }, [assessmentModels.data, props.data, gradeSelectOption]);

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
      if (assessmentModels.data === undefined || attainments.data === undefined)
        return [];

      const assessmentModel = assessmentModels.data.find(
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
    [assessmentModels.data, attainments.data]
  );

  // Creating Grades columns
  const dynamicColumns = useMemo(() => {
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
                  '0'
                }
                color="secondary"
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
              height: '150%',
              // border: '1px solid black',
              borderBlockEnd: '1px solid lightgray',
              borderLeft: '1px solid lightgray',
              borderEndStartRadius: '10px',
              // backgroundColor: 'black',
              position: 'absolute',
              left: '0px',
              top: '-102%',
              zIndex: -1,
            },
          }}
        />
      ),
    }),
    columnHelper.accessor('user.studentNumber', {
      header: 'Student Number',
      meta: {PrettyChipPosition: 'first'},
      cell: ({row, getValue}) => {
        // TODO: Remove link
        return getValue();
      },
    }),
    // columnHelper.accessor('credits', {
    //   header: 'Credits',
    //   enableSorting: false,
    //   cell: info => info.getValue(),
    //   aggregatedCell: () => null,
    // }),
    columnHelper.accessor(row => row, {
      header: 'Final Grade',
      enableSorting: false,
      // cell: info => info.getValue(),
      cell: ({getValue}) =>
        // <GradeCell
        //   studentNumber={'123'}
        //   attainemntResults={getValue().finalGrades?.[0]}
        //   finalGrade={true}
        // />
        getValue().finalGrades?.[0].grade ?? '-',
      aggregatedCell: () => null,
    }),
    columnHelper.accessor(row => row, {
      header: 'Grade preview',
      meta: {PrettyChipPosition: 'middle'},
      sortingFn: (a, b, columnId) => {
        const valA =
          a.getValue<GroupedStudentRow>(columnId).predictedFinalGrades;
        const valB =
          b.getValue<GroupedStudentRow>(columnId).predictedFinalGrades;
        if (valB === undefined) return 1;
        if (valA === undefined) return -1;
        for (let i = 0; i < valA.length; i++) {
          if (valA[i] < valB[i]) return -1;
          if (valA[i] > valB[i]) return 1;
        }
        return 0;
      },
      cell: info => (
        <PredictedGradeCell
          row={info.getValue()}
          assessmentModelIds={assessmentModels.data?.map(model => model.id)}
          onClick={() => {
            if (
              assessmentModels.data === undefined ||
              assessmentModels.data.length === 0
            )
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
      columns: dynamicColumns,
    }),
  ];

  const table = useReactTable({
    data: groupedData,
    columns: [...staticColumns],
    getCoreRowModel: getCoreRowModel(),
    // Selection
    onRowSelectionChange: selection => {
      setRowSelection(selection);
      if (table) table.options.state.rowSelection = rowSelection;
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
        assessmentModels={assessmentModels.data}
        row={userGraphData}
      />
      {props.children}
    </GradesTableContext.Provider>
  );
};
export const useTableContext = (): TableContextProps => {
  const context = useContext(GradesTableContext);
  if (context === undefined) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};
