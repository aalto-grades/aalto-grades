// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData, StudentRow} from '@common/types';
import {batchCalculateGraph} from '@common/util/calculateGraph';
import {ArrowUpward, ExpandLess, ExpandMore, Sort} from '@mui/icons-material';
import {Badge, Checkbox, Icon, IconButton} from '@mui/material';
import '@tanstack/react-table';
import {
  ExpandedState,
  GroupingState,
  RowData,
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import * as React from 'react';
import {useParams} from 'react-router-dom';
import {useGetAllAssessmentModels, useGetAttainments} from '../../hooks/useApi';
import {findBestGradeOption} from '../../utils';
import PrettyChip from '../shared/PrettyChip';
import GradeCell from './GradeCell';
import PredictedGradeCell from './PredictedGradeCell';
import UserGraphDialog from './UserGraphDialog';
// This module is used to create meta data for colums cells
declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    PrettyChipPosition: 'first' | 'middle' | 'last' | 'alone';
  }
}

export type GroupedStudentRow = {
  grouping: string;
} & ExtendedStudentRow;

type ExtendedStudentRow = StudentRow & {
  predictedFinalGrades?: (string | number)[];
};

type PropsType = {
  data: StudentRow[];
  selectedStudents: StudentRow[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<StudentRow[]>>;
};

function toggleString(arr: string[], str: string): string[] {
  const index = arr.indexOf(str);
  if (index > -1) {
    arr.splice(index, 1);
  } else {
    arr.push(str);
  }
  return arr;
}

// Group the rows by the last attainment date
function groupByLastAttainmentDate(gradesList: ExtendedStudentRow[]) {
  // const result: {date: string; rows: StudentGradesTree[]}[] = [];
  function findNewestDate(row: StudentRow) {
    let newestDate = new Date('1970-01-01');
    for (const att of row.attainments) {
      const bestGradeDate = new Date(
        findBestGradeOption(att.grades, {
          avoidExpired: true,
          preferExpiredToNull: true,
          useLatest: false, // TODO: Read from state?
        })?.date ?? ''
      );
      // Get best grade date for each attainment and get the newest
      newestDate =
        newestDate && new Date(bestGradeDate ?? '') > newestDate
          ? bestGradeDate
          : newestDate;
    }
    return newestDate.toISOString().split('T')[0];
  }

  // Array implementation
  const result: Array<GroupedStudentRow> = [];
  for (const row of gradesList) {
    const date = findNewestDate(row);
    result.push({grouping: date, ...row});
  }
  return result;
}

/**
 * Finds the previous grade that has been exported to Sisu, excluding the best grade.
 * @param bestGrade - The best grade option.
 * @param row - The student row.
 * @returns The previous grade that has been exported to Sisu, or null if none is found.
 */
// Commented until Final grade is reimplemented
// function findPreviouslyExportedToSisu(bestGrade: GradeOption, row: StudentRow) {
//   for (const gr of row.finalGrades) {
//     if (bestGrade?.gradeId === gr.gradeId) continue; //Skip the best grade (we need to check for previous ones)
//     if (gr.exportedToSisu) {
//       //We found one!
//       if (bestGrade.exportedToSisu) {
//         //If the best grade is also exported, we need to check which one is newer
//         if (bestGrade.exportedToSisu < gr.exportedToSisu) return gr;
//       } else {
//         return gr;
//       }
//     }
//   }
//   return null;
// }

const columnHelper = createColumnHelper<GroupedStudentRow>();
// predicted grade divided by model
function predictGrades(
  rows: StudentRow[],
  assessmentModels: AssessmentModelData[]
) {
  return assessmentModels.map(model => {
    return batchCalculateGraph(
      model.graphStructure,
      rows.map(row => {
        return {
          userId: row.user.id,
          attainments: row.attainments.map(att => ({
            attainmentId: att.attainmentId,
            grade: att.grades.length === 0 ? 0 : att.grades[0].grade, // TODO: best grade should be taken 🐛
          })),
        };
      })
    );
  });
}

// TODO: Better column definitions
// TODO: Better typing and freeze how to access data
const CourseResultsTanTable: React.FC<PropsType> = props => {
  const [isPending, startTransition] = React.useTransition();
  const {courseId} = useParams() as {
    courseId: string;
  };
  const attainmentList = useGetAttainments(courseId).data ?? [];
  const {data: assessmentModels, isLoading} =
    useGetAllAssessmentModels(courseId);
  // Row are always grouped, toggling grouping just add the grouping column to the table
  const groupedData = React.useMemo(() => {
    let predictedGrades: ReturnType<typeof predictGrades> = [];
    if (assessmentModels) {
      startTransition(() => {
        predictedGrades = predictGrades(props.data, assessmentModels); // Takes too much time...?
      });
    }

    return groupByLastAttainmentDate(
      props.data.map(row => {
        return {
          ...row,
          predictedFinalGrades:
            predictedGrades.length > 0
              ? predictedGrades.map(pg => pg[row.user.id].finalGrade)
              : ['No models'],
        };
      })
    );
  }, [props.data, assessmentModels]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [userGraphOpen, setUserGraphOpen] = React.useState<boolean>(false);
  const [userGraphData, setUserGraphData] =
    React.useState<GroupedStudentRow | null>(null);
  // const [globalFilter, setGlobalFilter] = React.useState('');

  React.useEffect(() => {
    props.setSelectedStudents(_ => {
      return table.getSelectedRowModel().rows.map(row => {
        // Setting selectedStudnets
        return row.original;
      });
    });
  }, [rowSelection]);

  // console.log(expanded);
  // console.log(rowSelection);

  // Creating Grades columns
  const dynamicColumns = attainmentList.map(att => {
    return columnHelper.accessor(
      row => row.attainments.find(a => a.attainmentId == att.id),
      {
        header: att.name,
        meta: {PrettyChipPosition: 'alone'},
        enableSorting: false,
        size: 120,
        cell: ({getValue}) => (
          <GradeCell studentNumber={'123'} attainemntResults={getValue()} />
        ),
        footer: att.name,
      }
    );
  });
  // Dynamic columns but instead of using the flat array of attainments, use the tree
  // function createAssignmentRow(
  //   subAssignment: AttainmentData[] // : (ColumnDef<GroupedStudentRow, any>)[]
  // ): (
  //   | ReturnType<typeof columnHelper.accessor>
  //   | ReturnType<typeof columnHelper.group>
  // )[] {
  //   return subAssignment.map(att => {
  //     if ((att.subAttainments?.length ?? 0 > 0) && att.subAttainments) {
  //       return columnHelper.group({
  //         header: att.name,
  //         meta: {PrettyChipPosition: 'alone'},
  //         columns: [
  //           columnHelper.accessor(row => getAttainmentGrade(row, att.id ?? 0), {
  //             header: att.name,
  //             meta: {PrettyChipPosition: 'alone'},
  //             enableSorting: false,
  //             cell: ({getValue}) => (
  //               <GradeCell
  //                 studentNumber={'123'}
  //                 attainemntResults={getValue()}
  //                 finalGrade={false}
  //               />
  //             ),
  //           }),
  //           ...createAssignmentRow(att.subAttainments),
  //         ],
  //       });
  //     }

  //     return columnHelper.accessor(
  //       row => getAttainmentGrade(row, att.id ?? 0),
  //       {
  //         header: att.name,
  //         meta: {PrettyChipPosition: 'alone'},
  //         enableSorting: false,
  //         cell: ({getValue}) => (
  //           <GradeCell
  //             studentNumber={'123'}
  //             attainemntResults={getValue()}
  //             finalGrade={false}
  //           />
  //         ),
  //       }
  //     );
  //   }) as (
  //     | ReturnType<typeof columnHelper.accessor>
  //     | ReturnType<typeof columnHelper.group>
  //   )[];
  // }
  // const dynamicColumns = createAssignmentRow([]);

  // props.attainmentTree?.subAttainments ?? [] //broken code

  // Creating grouping column
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
                  row.subRows.map(row => {
                    !row.getIsSelected() && row.getToggleSelectedHandler()(row);
                  });
                } else {
                  // All rows are selected, deselect all (and viceversa)
                  row.subRows.map(row => row.getToggleSelectedHandler()(row));
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
          assessmentModelIds={assessmentModels?.map(model => model.id)}
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
        // const bestGrade = findBestGradeOption(row?.finalGrades);
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

  // Virtualizer
  const {rows} = table.getRowModel();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // pixel height of each row
    overscan: 5,
  });

  return (
    <div>
      <UserGraphDialog
        open={userGraphOpen}
        onClose={() => setUserGraphOpen(false)}
        assessmentModels={assessmentModels}
        row={userGraphData}
      />
      <button
        onClick={() =>
          table.setGrouping(old => {
            const res = [...toggleString(old, 'grouping')];
            return res;
          })
        }
      >
        Group by Date
      </button>
      {isPending && <>Is Pending</>}
      <input
        type="text"
        value={
          (table.getColumn('user_studentNumber')?.getFilterValue() ??
            '') as string
        }
        onChange={e => {
          table.getColumn('user_studentNumber')?.setFilterValue(e.target.value);
        }}
        placeholder={'Search...'}
        className="w-36 border shadow rounded"
      />
      <div
        className="container"
        ref={parentRef}
        style={{
          overflowY: 'auto', // our scrollable table container
          position: 'relative', // needed for sticky header
          height: '80vh', // should be a fixed height
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            borderSpacing: '0',
            // display: 'grid',
          }}
        >
          <thead
            style={{
              // display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <tr
                key={headerGroup.id}
                style={{
                  display: 'flex',
                  width: '100%',
                  backgroundColor: 'white',
                }}
              >
                {headerGroup.headers.map(header => (
                  <th
                    style={{
                      // border: '1px solid lightgray',
                      padding: '0px',
                      height: '50px',
                      display: 'flex',
                      // Calculate correct size for groupHeaders
                      width:
                        header.subHeaders.length !== 0
                          ? header.subHeaders.reduce(
                              (acc, subHeader) => acc + subHeader.getSize(),
                              0
                            )
                          : header.getSize(),
                    }}
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <PrettyChip
                        position={
                          header.column.columnDef.meta?.PrettyChipPosition ===
                          'alone'
                            ? undefined
                            : header.column.columnDef.meta
                                ?.PrettyChipPosition ?? 'middle'
                        }
                        style={{
                          fontWeight: 'bold',
                        }}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {!header.column.getCanSort() ? null : (
                            <Icon>
                              <>
                                {{
                                  asc: <ArrowUpward />,
                                  desc: (
                                    <ArrowUpward style={{rotate: '180deg'}} />
                                  ),
                                }[header.column.getIsSorted() as string] ?? (
                                  <Sort></Sort>
                                )}
                              </>
                            </Icon>
                          )}
                        </>
                      </PrettyChip>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            style={{
              display: 'grid',
              height: `${virtualizer.getTotalSize()}px`, // tells scrollbar how big the table is
              position: 'relative', // needed for absolute positioning of rows
            }}
          >
            {virtualizer.getVirtualItems().map(virtualRow => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <tr
                  data-index={virtualRow.index} // needed for dynamic row height measurement
                  ref={node => virtualizer.measureElement(node)} // measure dynamic row height
                  key={row.id}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`, // this should always be a `style` as it changes on scroll
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td
                        key={cell.id}
                        {...{
                          style: {
                            padding: '0px',
                            height: '50px',
                            textAlign: 'center',
                            display: 'flex',
                            width: cell.column.getSize(),
                            zIndex: 1,
                          },
                        }}
                      >
                        {cell.getIsGrouped() ? (
                          // If it's a grouped cell, add an expander and row count
                          <>
                            {/* <Badge
                          badgeContent={
                            row.getIsExpanded() ? null : row.subRows.length
                          }
                          color="primary"
                        >
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={row.getToggleExpandedHandler()}
                            disabled={!row.getCanExpand()}
                          >
                            {row.getIsExpanded() ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )}
                          </IconButton>
                        </Badge> */}
                            <PrettyChip
                              onClick={row.getToggleExpandedHandler()}
                              position="first"
                            >
                              <>
                                <Badge
                                  badgeContent={
                                    row.getIsExpanded()
                                      ? null
                                      : row.subRows.length
                                  }
                                  color="primary"
                                >
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    // onClick={row.getToggleExpandedHandler()}
                                    disabled={!row.getCanExpand()}
                                  >
                                    {row.getIsExpanded() ? (
                                      <ExpandLess />
                                    ) : (
                                      <ExpandMore />
                                    )}
                                  </IconButton>
                                </Badge>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}{' '}
                              </>
                            </PrettyChip>
                            {/* {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}{' '} */}
                            {/* ({row.subRows.length}) */}
                          </>
                        ) : cell.getIsAggregated() ? (
                          // If the cell is aggregated, use the Aggregated
                          // renderer for cell
                          flexRender(
                            cell.column.columnDef.aggregatedCell ??
                              cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          <>
                            {cell.getValue() === undefined ? (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderBottom: '1px solid lightgray',
                                  height: '100%',
                                  width: '100%',
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* <tfoot>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot> */}
        </table>
      </div>

      {/* <StudentGradesDialog
        user={user as FinalGradeData}
        setOpen={setShowUserGrades}
        open={showUserGrades}
      /> */}
    </div>
  );
};
export default CourseResultsTanTable;
