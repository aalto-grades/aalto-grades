// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowUpward, ExpandLess, ExpandMore, Sort} from '@mui/icons-material';
import {Badge, Icon, IconButton, useTheme} from '@mui/material';
import {type Cell, type Row, flexRender} from '@tanstack/react-table';
import {useVirtualizer} from '@tanstack/react-virtual';
import {type JSX, useRef} from 'react';

import PrettyChip from '@/components/shared/PrettyChip';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {useTableContext} from '@/context/useTableContext';

/** Render table cell */
const RenderCell = ({
  row,
  cell,
}: {
  row: Row<GroupedStudentRow>;
  cell: Cell<GroupedStudentRow, unknown>;
}): JSX.Element => {
  // If it's a grouped cell, add an expander and row count
  if (cell.getIsGrouped()) {
    return (
      <PrettyChip onClick={row.getToggleExpandedHandler()} position="first">
        <>
          <Badge
            badgeContent={row.getIsExpanded() ? null : row.subRows.length}
            color="primary"
          >
            <IconButton
              size="small"
              color="primary"
              disabled={!row.getCanExpand()}
            >
              {row.getIsExpanded() ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Badge>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </>
      </PrettyChip>
    );
  }

  // If the cell is aggregated, use the Aggregated renderer for cell
  if (cell.getIsAggregated()) {
    return (
      <>
        {flexRender(
          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
          cell.getContext()
        )}
      </>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (cell.getIsPlaceholder()) return <></>;

  if (cell.getValue() === undefined) {
    return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>;
  }

  return (
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
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
};

const GradesTable = (): JSX.Element => {
  const theme = useTheme();
  const {table} = useTableContext();
  const {rows} = table.getRowModel();

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div ref={tableContainerRef} style={{overflowY: 'auto', height: 'calc(100vh - 255px)'}}>
      <style>
        {`
        thead:hover .column-resizer {
          opacity: 1 !important;
        }
      `}
      </style>
      <table style={{borderCollapse: 'collapse', borderSpacing: '0'}}>
        <thead style={{position: 'sticky', top: 0, zIndex: 50}}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                return (
                  <th
                    key={header.id}
                    className="table-header-cell"
                    style={{
                      padding: 0,
                      height: '50px',
                      backgroundColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.primary.main
                        : theme.palette.primary.light,
                      borderTopRightRadius: i === headerGroup.headers.length - 1 ? 5 : 0,
                      borderTopLeftRadius: i === 0 ? 5 : 0,
                      ...(header.column.getIsResizing() || header.column.getSize() !== header.column.columnDef.size
                        ? {width: header.getSize(), maxWidth: header.getSize()}
                        : {}),
                      position: 'relative',
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : (
                          <PrettyChip
                            position={
                              header.column.columnDef.meta?.PrettyChipPosition === 'alone'
                                ? undefined
                                : (header.column.columnDef.meta?.PrettyChipPosition ?? 'middle')
                            }
                            style={{
                              padding: '4px 10px',
                              backgroundColor:
                                theme.palette.mode === 'dark'
                                  ? theme.palette.primary.main
                                  : theme.palette.primary.light,
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                            }}
                            onClick={
                              header.column.getCanSort()
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                          >
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, overflow: 'hidden', maxWidth: '100%'}}>
                              <span style={{overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0}}>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                              {header.column.getCanSort() && (
                                <Icon>
                                  {(() => {
                                    const sorted = header.column.getIsSorted();
                                    if (sorted === 'asc') return <ArrowUpward />;
                                    if (sorted === 'desc') return <ArrowUpward style={{rotate: '180deg'}} />;
                                    return <Sort />;
                                  })()}
                                </Icon>
                              )}
                            </span>
                          </PrettyChip>
                        )}
                    <button
                      type="button"
                      aria-label="Resize column"
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={() => header.column.resetSize()}
                      className="column-resizer"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 2,
                        height: '90%',
                        width: '5px',
                        background: header.column.getIsResizing()
                          ? (theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.primary.dark)
                          : (theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.primary.main),
                        cursor: 'col-resize',
                        userSelect: 'none',
                        touchAction: 'none',
                        border: 'none',
                        padding: 0,
                        opacity: header.column.getIsResizing() ? 1 : 0,
                        transition: 'opacity 0.15s ease-in-out',
                        borderRadius: 5,
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{height: `${paddingTop}px`}} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '0px',
                      height: '50px',
                      textAlign: 'center',
                      overflow: cell.column.id === 'select' ? 'visible' : 'hidden',
                      ...(cell.column.getIsResizing() || cell.column.getSize() !== cell.column.columnDef.size
                        ? {width: cell.column.getSize(), maxWidth: cell.column.getSize()}
                        : {}),
                    }}
                  >
                    <RenderCell row={row} cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{height: `${paddingBottom}px`}} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default GradesTable;
