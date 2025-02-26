// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowUpward, ExpandLess, ExpandMore, Sort} from '@mui/icons-material';
import {Badge, Icon, IconButton} from '@mui/material';
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
  const {table} = useTableContext();
  const {rows} = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Pixel height of each row
    overscan: 5,
  });

  return (
    <div
      className="container"
      ref={parentRef}
      style={{
        overflowY: 'auto', // Scrollable table container
        position: 'relative', // Needed for sticky header
        height: 'calc(100vh - 255px)', // Should be a fixed height
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      <table
        style={{
          borderCollapse: 'collapse',
          borderSpacing: '0',
        }}
      >
        <thead
          style={{
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
                    padding: '0px',
                    height: '50px',
                    display: 'flex',
                    // Calculate correct size for groupHeaders
                    width:
                      header.subHeaders.length > 0
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
                          : (header.column.columnDef.meta?.PrettyChipPosition ??
                            'middle')
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
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUpward />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowUpward style={{rotate: '180deg'}} />
                            ) : (
                              <Sort />
                            )}
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
            height: `${virtualizer.getTotalSize()}px`, // Tells scrollbar how big the table is
            position: 'relative', // Needed for absolute positioning of rows
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                data-index={virtualRow.index} // Needed for dynamic row height measurement
                ref={node => virtualizer.measureElement(node)} // Measure dynamic row height
                style={{
                  display: 'flex',
                  position: 'absolute',
                  // This should always be a `style` as it changes on scroll
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                  zIndex: row.getIsGrouped() ? 5 : 'auto',
                }}
              >
                {row.getVisibleCells().map(cell => (
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
                    <RenderCell row={row} cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default GradesTable;
