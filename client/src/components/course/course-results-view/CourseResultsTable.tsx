// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowUpward, ExpandLess, ExpandMore, Sort} from '@mui/icons-material';
import {Badge, Icon, IconButton} from '@mui/material';
import {flexRender} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import {JSX, useRef} from 'react';

import PrettyChip from '@/components/shared/PrettyChip';
import {useTableContext} from '@/context/useTableContext';

// TODO: Better column definitions
// TODO: Better typing and freeze how to access data
const CourseResultsTable = (): JSX.Element => {
  const {table} = useTableContext();
  const {rows} = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // pixel height of each row
    overscan: 5,
  });

  return (
    <div>
      <div
        className="container"
        ref={parentRef}
        style={{
          overflowY: 'auto', // our scrollable table container
          position: 'relative', // needed for sticky header
          height: 'calc(100vh - 255px)', // should be a fixed height
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
              zIndex: 50,
            }}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <tr
                key={headerGroup.id}
                style={{
                  display: 'flex',
                  width: '100%',
                  backgroundColor: 'white',
                  borderBottom: '1px solid lightgray',
                }}
              >
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
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
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder ? null : (
                      <PrettyChip
                        position={
                          header.column.columnDef.meta?.PrettyChipPosition ===
                          'alone'
                            ? undefined
                            : (header.column.columnDef.meta
                                ?.PrettyChipPosition ?? 'middle')
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
                  key={row.id}
                  data-index={virtualRow.index} // needed for dynamic row height measurement
                  ref={node => virtualizer.measureElement(node)} // measure dynamic row height
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    // This should always be a `style` as it changes on scroll
                    transform: `translateY(${virtualRow.start}px)`,
                    width: '100%',
                    zIndex: row.getIsGrouped() ? 5 : 'auto',
                  }}
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          padding: '0px',
                          height: '50px',
                          textAlign: 'center',
                          display: 'flex',
                          width: cell.column.getSize(),
                          zIndex: 1,
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
                                )}
                              </>
                            </PrettyChip>
                            {/* {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )} */}
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
export default CourseResultsTable;
