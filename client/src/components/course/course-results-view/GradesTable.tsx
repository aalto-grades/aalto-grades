// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowUpward, ExpandLess, ExpandMore, Sort} from '@mui/icons-material';
import {Badge, Icon, IconButton, useTheme} from '@mui/material';
import {type Cell, type Row, flexRender} from '@tanstack/react-table';
import {type JSX, useEffect, useRef, useState} from 'react';

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

  const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [colWidths, setColWidths] = useState<number[]>([]);

  const currentLocale = document.documentElement.lang || 'en';

  useEffect(() => {
    if (headerRefs.current.length > 0) {
      const widths = headerRefs.current.map((cell, i) => {
        const measured = cell?.offsetWidth ?? 0;
        const metaMinWidth = table.getHeaderGroups()[0]?.headers[i]?.column?.getSize() ?? 0;
        return metaMinWidth ? Math.max(measured, metaMinWidth) : measured;
      });
      setColWidths(widths);
    }
  }, [table, currentLocale]);

  return (
    <div style={{overflowY: 'auto', height: 'calc(100vh - 255px)'}}>
      <table style={{borderCollapse: 'collapse', borderSpacing: '0'}}>
        <thead style={{position: 'sticky', top: 0, zIndex: 50}}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                return (
                  <th
                    key={header.id}
                    ref={(el) => { headerRefs.current[i] = el; }}
                    style={{
                      height: '50px',
                      padding: '4px 10px',
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? theme.palette.primary.main
                          : theme.palette.primary.light,
                      borderTopRightRadius: i === headerGroup.headers.length - 1 ? 5 : 0,
                      borderTopLeftRadius: i === 0 ? 5 : 0,
                      minWidth: header.column.getSize(),
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
                              backgroundColor:
                            theme.palette.mode === 'dark'
                              ? theme.palette.primary.main
                              : theme.palette.primary.light,
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={
                              header.column.getCanSort()
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                          >
                            <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, i) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '0px',
                    height: '50px',
                    textAlign: 'center',
                    width: `${colWidths[i] ? colWidths[i] : cell.column.getSize()}px`,
                  }}
                >
                  <RenderCell row={row} cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default GradesTable;
