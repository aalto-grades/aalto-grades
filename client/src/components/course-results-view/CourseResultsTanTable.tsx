// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {Badge, Box, Checkbox, IconButton, Link, Tooltip} from '@mui/material';
import {
  ExpandedState,
  GroupingState,
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
import {
  AttainmentData,
  AttainmentGradeData,
  FinalGrade,
  GradeOption,
  StudentGradesTree,
} from 'aalto-grades-common/types';
import * as React from 'react';
import {findBestGradeOption} from '../../utils';
import GradeCell from './GradeCell';
import StudentGradesDialog from './StudentGradesDialog';
import PrettyChip from '../shared/PrettyChip';

type StudentRow = {
  attainmentId: number;
  studentNumber: string;
  credits: number;
  grades: Array<GradeOption>;
  flatAttainments: Array<AttainmentGradeData>;
  subAttainments?: Array<AttainmentGradeData>;
  // [attainmentId: string]: string | boolean | number;
};
type GroupedStudentRow = {
  grouping: string;
} & StudentRow;

type PropsType = {
  data: StudentGradesTree[];
  attainmentList: Array<AttainmentData>;
  selectedStudents: FinalGrade[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<FinalGrade[]>>;
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

// Find the attainment grade from the tree
function getAttainmentGrade(
  gradeTree: AttainmentGradeData,
  attainmentId: number
): AttainmentGradeData | null {
  if (!gradeTree.grades) return null;

  function traverseTree(
    grade: AttainmentGradeData
  ): AttainmentGradeData | null {
    if (grade.attainmentId === attainmentId) {
      return grade;
    }

    if (grade.subAttainments) {
      for (const subGrade of grade.subAttainments) {
        const maybeFound: AttainmentGradeData | null = traverseTree(subGrade);
        if (maybeFound) return maybeFound;
      }
    }
    return null;
  }

  return traverseTree(gradeTree);
}

// Flatten the tree into a list of rows
function flattenTree(studentTree: StudentGradesTree) {
  const result: StudentRow = {...studentTree, flatAttainments: []};

  function addSubAttainments(sAtt: AttainmentGradeData[]) {
    if (sAtt) {
      result.flatAttainments.push(...sAtt);
      for (const subAtt of sAtt) {
        addSubAttainments(subAtt.subAttainments ?? []);
      }
    }
  }
  addSubAttainments(studentTree.subAttainments ?? []);
  return result;
}

// Group the rows by the last attainment date
function groupByLastAttainmentDate(gradesList: StudentRow[]) {
  // const result: {date: string; rows: StudentGradesTree[]}[] = [];
  function findNewestDate(row: StudentRow) {
    let newestDate = new Date('1970-01-01');
    for (const att of row.flatAttainments) {
      const bestGradeDate = new Date(
        findBestGradeOption(att.grades ?? [], {
          avoidExpired: true,
          preferExpiredToNull: true,
        })?.date ?? ''
      );
      //Get best grade date for each attainment and get the newest
      newestDate =
        newestDate && new Date(bestGradeDate ?? '') > newestDate
          ? bestGradeDate
          : newestDate;
    }
    return newestDate.toISOString().split('T')[0];
  }

  //Dict implementation
  // const result: {[date: string]: StudentRow[]} = {};
  // for (const row of gradesList) {
  //   const date = findNewestDate(row);
  //   if (!result[date]) {
  //     result[date] = [];
  //   }
  //   result[date].push(row);
  // }
  // let finalRes: {date: string; rows: StudentRow[]}[] = [];
  // for (const d of Object.keys(result)) {
  //   finalRes = finalRes.concat([{date: d, rows: result[d]}]);
  // }
  // return finalRes;

  //Array implementation
  const result: Array<GroupedStudentRow> = [];
  for (const row of gradesList) {
    const date = findNewestDate(row);
    result.push({grouping: date, ...row});
  }
  return result;
}

const columnHelper = createColumnHelper<GroupedStudentRow>();

//TODO: Better column definitions
//TODO: Better typing and freeze how to access data
const CourseResultsTanTable: React.FC<PropsType> = props => {
  const flattenData = React.useMemo(
    () => props.data.map(flattenTree),
    [props.data]
  );
  // Row are always grouped, toggling grouping just add the grouping column to the table
  const groupedData = React.useMemo(
    () => groupByLastAttainmentDate(flattenData),
    [flattenData]
  );
  console.log(groupedData);

  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // const [globalFilter, setGlobalFilter] = React.useState('');
  //Need to move it in a better place needed for the dialog
  const [user, setUser] = React.useState<FinalGrade | null>(null);
  const [showUserGrades, setShowUserGrades] = React.useState<boolean>(false);
  //End of shame paragraph

  React.useEffect(() => {
    props.setSelectedStudents(_ => {
      return table.getSelectedRowModel().rows.map(row => {
        //Setting selectedStudnets
        console.log(row.original);
        return row.original as unknown as FinalGrade;
      });
    });
  }, [rowSelection]);
  console.log(expanded);
  console.log(rowSelection);

  // Creating Grades columns
  const dynamicColumns = props.attainmentList.map(att => {
    return columnHelper.accessor(row => getAttainmentGrade(row, att.id ?? 0), {
      header: att.name,
      cell: ({getValue}) => (
        <GradeCell studentNumber={'123'} attainemntResults={getValue()} />
      ),
      footer: att.name,
    });
  });

  // Creating grouping column
  const groupingColumns =
    grouping.length > 0
      ? [
          columnHelper.accessor(row => row.grouping, {
            id: 'grouping',
            header: 'Latest attainment',
            cell: prop => prop.getValue(),
            aggregatedCell: () => null,
          }),
        ]
      : [];

  //Creating static columns
  const staticColumns = [
    ...groupingColumns,
    columnHelper.display({
      id: 'select',
      header: ({table}) => {
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              // borderRight: '1px black solid',
              // borderLeft: '1px black solid',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                backgroundColor: 'white',
                border: '1px solid lightgray',
                borderRadius: '50px',
              }}
            >
              <Checkbox
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getIsSomeRowsSelected(),
                  onChange: table.getToggleAllRowsSelectedHandler(),
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
            </span>
          </Box>
        );
      },
      aggregatedCell: ({row}) => (
        <PrettyChip position="last">
          <>
            <Checkbox
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
    columnHelper.accessor('studentNumber', {
      header: 'Student Number',
      cell: ({row, getValue}) => {
        return (
          <Tooltip
            placement="top"
            title="Click to show individual grades for student"
          >
            <Link
              component="button"
              variant="body2"
              onClick={(): void => {
                setUser(row.original as unknown as FinalGrade);
                setShowUserGrades(true);
              }}
            >
              {getValue()}
            </Link>
          </Tooltip>
        );
      },
    }),
    columnHelper.accessor('credits', {
      header: 'Credits',
      cell: info => info.getValue(),
      aggregatedCell: () => null,
    }),
    columnHelper.accessor(row => row, {
      header: 'Final Grade',
      // cell: info => info.getValue(),
      cell: ({getValue}) => (
        <GradeCell
          studentNumber={'123'}
          attainemntResults={getValue()}
          finalGrade={true}
        />
      ),
      aggregatedCell: () => null,
    }),
    columnHelper.accessor(
      row =>
        // ATTENTION this function needs to have the same parameters of the one inside the grade cell
        // Clearly can be done in abetter way
        findBestGradeOption(row?.grades ?? [], {
          avoidExpired: true,
          preferExpiredToNull: true,
        })?.exportedToSisu ?? false,
      {
        header: 'Exported to Sisu',
        cell: info => (info.getValue() ? '✅' : '❌'),
        aggregatedCell: () => null,
      }
    ),
    columnHelper.group({header: 'Assignments', columns: dynamicColumns}),
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
    <div className="p-2">
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
      <input
        type="text"
        value={
          (table.getColumn('studentNumber')?.getFilterValue() ?? '') as string
        }
        onChange={e =>
          table.getColumn('studentNumber')?.setFilterValue(e.target.value)
        }
        placeholder={'Search...'}
        className="w-36 border shadow rounded"
      />
      <table style={{borderCollapse: 'collapse', borderSpacing: '0'}}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  style={{
                    // border: '1px solid lightgray',
                    padding: '5px',
                  }}
                  key={header.id}
                  colSpan={header.colSpan}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {
                        {asc: ' 🔼', desc: ' 🔽'}[
                          header.column.getIsSorted() as string
                        ]
                      }
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              // style={{border: '1px solid lightgray'}}
            >
              {row.getVisibleCells().map(cell => {
                return (
                  <td
                    key={cell.id}
                    {...{
                      style: {
                        // background: cell.getIsGrouped()
                        //   ? '#0aff0082'
                        //   : cell.getIsAggregated()
                        //   ? '#ffa50078'
                        //   : cell.getIsPlaceholder()
                        //   ? '#ff000042'
                        //   : 'white',
                        padding: '0px',
                        height: '50px',
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
                                row.getIsExpanded() ? null : row.subRows.length
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
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
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
      <StudentGradesDialog
        user={user as FinalGrade}
        setOpen={setShowUserGrades}
        open={showUserGrades}
      />
    </div>
  );
};
export default CourseResultsTanTable;
