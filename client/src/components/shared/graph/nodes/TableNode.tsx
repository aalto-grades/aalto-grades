// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {useTheme} from '@mui/material';
import {Handle, type NodeProps, Position} from '@xyflow/react';
import {
  type CSSProperties,
  type ChangeEvent,
  type JSX,
  useContext,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';

import type {TableNodeSettings, TableNodeValue} from '@/common/types';
import {
  DEFAULT_TABLE_COL_HEADERS,
  DEFAULT_TABLE_ROW_HEADERS,
  DEFAULT_TRIANGULAR_GRID,
} from '@/common/util/tableDefaults';
import OutputValue from '@/components/shared/graph/nodes/parts/OutputValue';
import {NodeDataContext, NodeValuesContext} from '@/context/GraphProvider';
import BaseNode from './BaseNode';

type LocalSettings = {
  rowHeaders: string[];
  colHeaders: string[];
  grid: string[][];
};

const TableNode = (props: NodeProps): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {nodeData, setNodeSettings} = useContext(NodeDataContext);
  const {id, isConnectable} = props;
  const nodeValues = useContext(NodeValuesContext);

  const settings = (nodeData[id].settings ?? {
    rowHeaders: [] as number[],
    colHeaders: [] as number[],
    grid: [] as number[][],
  }) as TableNodeSettings;

  const initSettings: LocalSettings = {
    rowHeaders: (settings.rowHeaders.length > 0
      ? settings.rowHeaders
      : DEFAULT_TABLE_ROW_HEADERS
    ).map(v => v.toString()),
    colHeaders: (settings.colHeaders.length > 0
      ? settings.colHeaders
      : DEFAULT_TABLE_COL_HEADERS
    ).map(v => v.toString()),
    grid: (settings.grid.length > 0
      ? settings.grid
      : DEFAULT_TRIANGULAR_GRID
    ).map(row => row.map(v => v.toString())),
  };

  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initSettings);

  const nodeValue = nodeValues[id] as TableNodeValue;

  // Compute active column/row indices from connected inputs.
  const getNumericFromSource = (v: unknown): number | null =>
    typeof v === 'number' ? v : null;

  const sources = nodeValue.sources;
  const getBySuffix = (suffix: string): number | null => {
    for (const [key, src] of Object.entries(sources)) {
      if (!src.isConnected) continue;
      if (key.endsWith(`-${suffix}`)) return getNumericFromSource(src.value);
    }
    return null;
  };

  const connectedValues = Object.values(sources)
    .filter(s => s.isConnected)
    .map(s => getNumericFromSource(s.value))
    .filter((v): v is number => v !== null);

  const byCol = getBySuffix('col');
  const first = byCol ?? connectedValues[0];
  const byRow = getBySuffix('row');
  const second = byRow ?? connectedValues[1];

  const rowNums = localSettings.rowHeaders.map(v => Number.parseFloat(v));
  const colNums = localSettings.colHeaders.map(v => Number.parseFloat(v));

  let activeColIndex: number | null = null;
  let activeRowIndex: number | null = null;
  if (first) {
    const ci = colNums.indexOf(first);
    if (ci !== -1 && ci >= 0 && ci < localSettings.colHeaders.length)
      activeColIndex = ci;
  }
  if (second) {
    const ri = rowNums.indexOf(second);
    if (ri !== -1 && ri >= 0 && ri < localSettings.rowHeaders.length)
      activeRowIndex = ri;
  }

  // Duplicate header indices for column/row highlighting
  const getDuplicateIndices = (arr: string[]): Set<number> => {
    const counts = new Map<string, number>();
    for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
    const res = new Set<number>();
    arr.forEach((v, i) => {
      if ((counts.get(v) ?? 0) > 1) res.add(i);
    });
    return res;
  };

  const dupColIndices = getDuplicateIndices(localSettings.colHeaders);
  const dupRowIndices = getDuplicateIndices(localSettings.rowHeaders);

  // Generate stable keys for headers by appending an occurrence count for duplicates
  const getStableKeys = (arr: string[]): string[] => {
    const counts = new Map<string, number>();
    return arr.map((v) => {
      const c = counts.get(v) ?? 0;
      counts.set(v, c + 1);
      return c === 0 ? v : `${v}#${c}`;
    });
  };

  const colKeys = getStableKeys(localSettings.colHeaders);
  const rowKeys = getStableKeys(localSettings.rowHeaders);

  const updateParent = (newLocal: LocalSettings): void => {
    // convert to numbers
    const rowHeaders = newLocal.rowHeaders.map(v => Number.parseFloat(v));
    const colHeaders = newLocal.colHeaders.map(v => Number.parseFloat(v));
    const grid = newLocal.grid.map(row =>
      row.map(cell => Number.parseFloat(cell)),
    );
    setNodeSettings(id, {rowHeaders, colHeaders, grid});
  };

  const handleRowHeaderChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const ns = {...localSettings};
    ns.rowHeaders[index] = e.target.value;
    setLocalSettings(ns);
    updateParent(ns);
  };

  const handleColHeaderChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const ns = {...localSettings};
    ns.colHeaders[index] = e.target.value;
    setLocalSettings(ns);
    updateParent(ns);
  };

  const handleCellChange = (
    r: number,
    c: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const ns = {
      ...localSettings,
      grid: localSettings.grid.map(row => [...row]),
    };
    ns.grid[r][c] = e.target.value;
    setLocalSettings(ns);
    updateParent(ns);
  };

  const addRow = () => {
    const ns = {...localSettings};
    const last =
      ns.rowHeaders.length > 0
        ? Number.parseFloat(ns.rowHeaders.at(-1) ?? '0')
        : 0;
    const newHeader = (
      Number.isFinite(last) ? last + 1 : ns.rowHeaders.length + 1
    ).toString();
    ns.rowHeaders.push(newHeader);
    // Fill new row following pattern: value = min(rowHeader, colHeader)
    const newHeaderNum = Number.parseFloat(newHeader);
    ns.grid.push(
      ns.colHeaders.map(ch =>
        String(
          Number.isFinite(newHeaderNum)
            ? Math.min(newHeaderNum, Number.parseFloat(ch))
            : newHeader,
        ),
      ),
    );
    setLocalSettings(ns);
    updateParent(ns);
  };
  const removeRow = () => {
    if (localSettings.rowHeaders.length === 0) return;
    const ns = {...localSettings};
    ns.rowHeaders.pop();
    ns.grid.pop();
    setLocalSettings(ns);
    updateParent(ns);
  };
  const addCol = () => {
    const ns = {...localSettings};
    const last =
      ns.colHeaders.length > 0
        ? Number.parseFloat(ns.colHeaders.at(-1) ?? '0')
        : 0;
    const newHeader = (
      Number.isFinite(last) ? last + 1 : ns.colHeaders.length + 1
    ).toString();
    ns.colHeaders.push(newHeader);
    const newHeaderNum = Number.parseFloat(newHeader);
    ns.grid = ns.grid.map((row, ri) => {
      const rowNum = Number.parseFloat(ns.rowHeaders[ri] ?? '0');
      const newVal = String(
        Number.isFinite(newHeaderNum)
          ? Math.min(rowNum, newHeaderNum)
          : newHeader,
      );
      return row.concat(newVal);
    });
    setLocalSettings(ns);
    updateParent(ns);
  };
  const removeCol = () => {
    if (localSettings.colHeaders.length === 0) return;
    const ns = {...localSettings};
    ns.colHeaders.pop();
    ns.grid = ns.grid.map((row) => {
      const r = [...row];
      r.pop();
      return r;
    });
    setLocalSettings(ns);
    updateParent(ns);
  };

  return (
    <BaseNode {...props}>
      <Handle
        type="target"
        id={`${id}-col`}
        style={{height: '12px', width: '12px', left: '50%'}}
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        id={`${id}-row`}
        style={{height: '12px', width: '12px'}}
        position={Position.Left}
        isConnectable={isConnectable}
      />

      <table
        style={{
          width: '100%',
          margin: '5px 0px',
          backgroundColor: theme.palette.graph.light,
        }}
      >
        <tbody>
          <tr>
            <th style={{width: '24px', textAlign: 'center'}}>
              {(() => {
                const dupCols = dupColIndices.size > 0;
                const dupRows = dupRowIndices.size > 0;
                if (!dupCols && !dupRows) return null;
                const msgParts: string[] = [];
                if (dupCols) msgParts.push('duplicate column headers');
                if (dupRows) msgParts.push('duplicate row headers');
                const msg = msgParts.join(' and ');
                return (
                  <span
                    title={msg}
                    style={{color: theme.palette.warning.main}}
                  >
                    ⚠️
                  </span>
                );
              })()}
            </th>
            {localSettings.colHeaders.map((h, ci) => {
              const isDup = dupColIndices.has(ci);
              const isActiveCol = activeColIndex === ci;
              const headerStyle: CSSProperties = {
                padding: '4px',
                backgroundColor: isDup
                  ? theme.palette.warning.light
                  : theme.palette.action.selected,
                border: isDup
                  ? `1px solid ${theme.palette.warning.main}`
                  : '1px solid black',
                boxShadow: isActiveCol
                  ? `inset 0 0 0 2px ${theme.palette.success.main}`
                  : undefined,
              };
              return (
                <th key={colKeys[ci]} style={headerStyle}>
                  <input
                    style={{width: '40px'}}
                    value={h}
                    onChange={e => handleColHeaderChange(ci, e)}
                  />
                </th>
              );
            })}
          </tr>
          {localSettings.rowHeaders.map((rh, ri) => (
            <tr key={rowKeys[ri]}>
              <td
                style={{
                  padding: '4px',
                  backgroundColor: dupRowIndices.has(ri)
                    ? theme.palette.warning.light
                    : theme.palette.action.selected,
                  border: dupRowIndices.has(ri)
                    ? `1px solid ${theme.palette.warning.main}`
                    : '1px solid black',
                  boxShadow:
                    activeRowIndex === ri
                      ? `inset 0 0 0 2px ${theme.palette.success.main}`
                      : undefined,
                }}
              >
                <input
                  style={{width: '40px'}}
                  value={rh}
                  onChange={e => handleRowHeaderChange(ri, e)}
                />
              </td>
              {localSettings.colHeaders.map((_, ci) => {
                const isSelectedCell =
                  activeRowIndex === ri && activeColIndex === ci;
                const cellStyle: CSSProperties = {padding: '4px'};
                if (isSelectedCell)
                  cellStyle.backgroundColor = theme.palette.success.light;
                return (
                  <td key={`${rowKeys[ri]}-${colKeys[ci]}`} style={cellStyle}>
                    <input
                      style={{width: '40px'}}
                      value={localSettings.grid[ri]?.[ci] ?? ''}
                      onChange={e => handleCellChange(ri, ci, e)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{display: 'flex', gap: '8px'}}>
        <button type="button" onClick={addRow}>
          {t('shared.graph.new-row')}
        </button>
        <button
          type="button"
          onClick={removeRow}
          disabled={localSettings.rowHeaders.length === 0}
        >
          {t('shared.graph.remove-row')}
        </button>
        <button type="button" onClick={addCol}>
          {t('shared.graph.new-column')}
        </button>
        <button
          type="button"
          onClick={removeCol}
          disabled={localSettings.colHeaders.length === 0}
        >
          {t('shared.graph.remove-column')}
        </button>
      </div>

      <OutputValue
        text={t('shared.graph.node.table')}
        value={nodeValue.value}
      />

      <Handle
        type="source"
        id={`${id}-source`}
        style={{height: '12px', width: '12px'}}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
};

export default TableNode;
