// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {AccountTree} from '@mui/icons-material';
import {Badge, Checkbox} from '@mui/material';
import {
  type ExpandedState,
  type GroupingState,
  type SortingState,
  aggregationFn_sum,
  createColumnHelper,
  useTable,
} from '@tanstack/react-table';
import {
  type Dispatch,
  type JSX,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  type FinalGradeData,
  type FinalGradeFrozenInfo,
  type FrozenTaskGrade,
  GradingScale,
} from '@/common/types';
import FrozenGraphDialog from '@/components/course/finalized-grades-view/FrozenGraphDialog';
import FrozenGradeCell from '@/components/course/finalized-grades-view/table/FrozenGradeCell';
import IconButtonWithTip from '@/components/shared/IconButtonWithTooltip';
import PrettyChip from '@/components/shared/PrettyChip';
import {features} from '@/components/shared/table/features';
import {usePersistedTableState} from '@/components/shared/table/usePersistedTableState';
import {useGetCourse} from '@/hooks/useApi';
import {getGradeString} from '@/utils';
import {bestFrozenGrade, frozenPartGrade} from '@/utils/frozen';

/** A final grade row with the frozen data pre-extracted for the table */
export type FinalGradeRow = FinalGradeData & {
  /** Key of the grading model group ('manual' for modelless grades) */
  modelKey: string;
  /** Display name of the grading model (frozen name preferred) */
  modelName: string;
  /** Course part grades keyed by part id, from the frozen snapshot */
  partGrades: {[partId: number]: number | null};
  /** Frozen task grades keyed by task id */
  taskGrades: {[taskId: number]: FrozenTaskGrade[]};
};

export type SelectedFinalGradeModel = 'any' | 'manual' | {modelId: number};

export type FinalGradesTableContextProps = {
  table: ReturnType<typeof useTable<typeof features, FinalGradeRow>>;
  selectedModel: SelectedFinalGradeModel;
  setSelectedModel: Dispatch<SetStateAction<SelectedFinalGradeModel>>;
  /** Model filter options, derived from the frozen/live data */
  modelOptions: {id: number | 'manual'; name: string}[];
};

export const FinalGradesTableContext =
  createContext<FinalGradesTableContextProps | null>(null);

const columnHelper = createColumnHelper<typeof features, FinalGradeRow>();

// Schemas validating the persisted view state, so stale or corrupted storage
// falls back to the defaults instead of breaking the table
const persistedStateSchemas = {
  expanded: z.union([z.boolean(), z.record(z.string(), z.boolean())]),
  grouping: z.array(z.string()),
  sorting: z.array(z.object({id: z.string(), desc: z.boolean()})),
  model: z.union([z.literal('any'), z.literal('manual'), z.object({modelId: z.number()})]),
};

/**
 * Flattens the final grades into table rows, extracting the model name and the
 * course part / task grades from the frozen snapshots.
 */
const buildRows = (
  finalGrades: FinalGradeData[],
  modelNameFallback: (modelId: number | null) => string
): FinalGradeRow[] => {
  // Model names from the frozen hard copies, preferring the snapshot over the
  // (possibly renamed or deleted) live model
  const names = new Map<string, string>();
  for (const fg of finalGrades) {
    const key = fg.gradingModelId === null ? 'manual' : String(fg.gradingModelId);
    if (!names.has(key)) names.set(key, modelNameFallback(fg.gradingModelId));
    const frozenName = fg.frozenInfo?.gradingModel?.name;
    if (frozenName !== undefined) names.set(key, frozenName);
  }

  return finalGrades.map((fg) => {
    const key =
      fg.gradingModelId === null ? 'manual' : String(fg.gradingModelId);
    const partGrades: FinalGradeRow['partGrades'] = {};
    const taskGrades: FinalGradeRow['taskGrades'] = {};
    if (fg.frozenInfo !== null) {
      for (const part of fg.frozenInfo.courseParts) {
        partGrades[part.id] = frozenPartGrade(fg.frozenInfo, part.id);
      }
      for (const task of fg.frozenInfo.tasks) {
        taskGrades[task.id] = task.grades;
      }
    }
    return {
      ...fg,
      modelKey: key,
      modelName: names.get(key) ?? '-',
      partGrades,
      taskGrades,
    };
  });
};

type PropsType = {data: FinalGradeData[]} & PropsWithChildren;

export const FinalGradesTableProvider = ({
  data,
  children,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const course = useGetCourse(courseId);
  const gradingScale = course.data?.gradingScale ?? GradingScale.Numerical;

  // View state persisted to localStorage (shared object per course) so
  // grouping, sorting and filters survive a page refresh. Row selection and
  // the search box are intentionally not persisted: selections are transient
  // and search is already synced to the ?search= query parameter.
  const tableStateKey = `final-grades-table-state-${courseId}`;

  const [selectedModel, setSelectedModel] =
    usePersistedTableState<SelectedFinalGradeModel>(
      tableStateKey,
      'model',
      'any',
      raw => persistedStateSchemas.model.parse(raw)
    );
  const [rowSelection, setRowSelection] = useState({});
  const [grouping, setGrouping] = usePersistedTableState<GroupingState>(
    tableStateKey,
    'grouping',
    [],
    raw => persistedStateSchemas.grouping.parse(raw)
  );
  const [expanded, setExpanded] = usePersistedTableState<ExpandedState>(
    tableStateKey,
    'expanded',
    {},
    (raw) => {
      const parsed = persistedStateSchemas.expanded.parse(raw);
      // The table always controls expansion with the object form
      return typeof parsed === 'boolean' ? {} : parsed;
    }
  );
  const [sorting, setSorting] = usePersistedTableState<SortingState>(
    tableStateKey,
    'sorting',
    [],
    raw => persistedStateSchemas.sorting.parse(raw)
  );
  const [globalFilter, setGlobalFilter] = useState('');

  const [graphOpen, setGraphOpen] = useState(false);
  const [graphData, setGraphData] = useState<FinalGradeRow | null>(null);

  const rows = useMemo(
    () =>
      buildRows(data, modelId =>
        modelId === null
          ? t('final-grades-view.manual-model')
          : t('final-grades-view.unknown-model')
      ),
    [data, t]
  );

  // Model filter options, in the same order as the groups
  const modelOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows)
      if (!seen.has(row.modelKey)) seen.set(row.modelKey, row.modelName);
    return [...seen.entries()]
      .sort(([a], [b]) =>
        a.localeCompare(b, undefined, {numeric: true})
      )
      .map(([key, name]) => ({
        id: key === 'manual' ? ('manual' as const) : Number(key),
        name,
      }));
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (selectedModel === 'any') return rows;
    if (selectedModel === 'manual')
      return rows.filter(row => row.modelKey === 'manual');
    return rows.filter(row => row.modelKey === String(selectedModel.modelId));
  }, [rows, selectedModel]);

  // Union of the frozen course parts and tasks, ordered by id. Only columns
  // present in the visible rows are created.
  const {partColumns, taskColumns} = useMemo(() => {
    const parts = new Map<number, string>();
    const tasks = new Map<number, {name: string; coursePartId: number}>();
    for (const row of visibleRows) {
      const frozen: FinalGradeFrozenInfo | null = row.frozenInfo;
      if (frozen === null) continue;
      for (const part of frozen.courseParts)
        if (!parts.has(part.id)) parts.set(part.id, part.name);
      for (const task of frozen.tasks)
        if (!tasks.has(task.id) && task.grades.length > 0)
          tasks.set(task.id, {name: task.name, coursePartId: task.coursePartId});
    }

    const partName = (id: number) => parts.get(id) ?? `#${id}`;

    return {
      partColumns: [...parts.entries()]
        .sort(([a], [b]) => a - b)
        .map(([id, name]) =>
          columnHelper.accessor(row => row.partGrades[id], {
            id: `part-${id}`,
            header: name,
            size: 80,
            meta: {PrettyChipPosition: 'alone', coursePart: true},
            footer: name,
          })
        ),
      taskColumns: [...tasks.entries()]
        .sort(([a], [b]) => a - b)
        .map(([id, task]) =>
          columnHelper.accessor(row => row.taskGrades[id], {
            id: `task-${id}`,
            header: task.name,
            size: 80,
            meta: {PrettyChipPosition: 'alone', coursePart: true},
            footer: `${partName(task.coursePartId)} → ${task.name}`,
            getGroupingValue: row => bestFrozenGrade(row.taskGrades[id] ?? []),
            cell: info => (
              <FrozenGradeCell
                grades={info.getValue() ?? []}
                gradingScale={gradingScale}
              />
            ),
          })
        ),
    };
  }, [visibleRows, gradingScale]);

  // --- Selection column ---
  const selectionColumn = columnHelper.display({
    id: 'select',
    size: 70,
    meta: {PrettyChipPosition: grouping.length > 0 ? 'last' : 'alone'},
    aggregationFn: aggregationFn_sum,
    header: ({table}) => (
      <>
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          sx={theme => ({
            ...(theme.palette.mode === 'dark' && {
              color: 'text.primary',
              '&.Mui-checked': {
                color: 'text.primary',
              },
              '&.MuiCheckbox-indeterminate': {
                color: 'text.primary',
              },
            }),
          })}
        />
        <span style={{marginLeft: '4px', marginRight: '15px'}}>
          <Badge
            badgeContent={table.getSelectedRowModel().rows.length || '0'}
            color="primary"
            max={999}
            sx={theme => ({
              ...(theme.palette.mode === 'dark' && {
                '& .MuiBadge-badge': {
                  backgroundColor: theme.palette.text.primary,
                  color: theme.palette.primary.main,
                },
              }),
            })}
          />
        </span>
      </>
    ),
    aggregatedCell: ({row}) => (
      <PrettyChip position="last">
        <>
          <Checkbox
            checked={row.getIsAllSubRowsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={(e) => {
              row.getToggleSelectedHandler({selectChildren: true})(e);
            }}
          />
          <span style={{marginLeft: '4px', marginRight: '15px'}}>
            <Badge
              badgeContent={
                row.subRows.filter(subRow => subRow.getIsSelected()).length
                || undefined
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
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        style={{
          marginLeft: '21px',
        }}
        sx={{
          '&::before': {
            content: '""',
            width: '11px',
            height: '60px',
            borderBlockEnd: '1px solid lightgray',
            borderLeft: '1px solid lightgray',
            borderEndStartRadius: '10px',
            position: 'absolute',
            left: '0px',
            bottom: '50%',
            zIndex: -1,
            pointerEvents: 'none',
          },
        }}
      />
    ),
  });

  const columns = [
    selectionColumn,
    columnHelper.accessor(row => row.user.studentNumber, {
      header: t('general.student-number'),
      meta: {PrettyChipPosition: 'first'},
      size: 100,
    }),
    columnHelper.accessor(row => row.user.name ?? '-', {
      header: t('general.name'),
      size: 120,
    }),
    columnHelper.accessor(row => row.modelName, {
      id: 'model',
      header: t('general.grading-model'),
      size: 120,
      getGroupingValue: row => row.modelName,
      meta: {PrettyChipPosition: 'middle'},
    }),
    columnHelper.accessor(row => row.grade, {
      id: 'finalGrade',
      header: t('general.final-grade'),
      size: 80,
      meta: {PrettyChipPosition: 'middle'},
      getGroupingValue: row => String(row.grade),
      cell: info => (
        <span>
          {getGradeString(t, gradingScale, info.getValue())}
          {info.row.original.frozenInfo !== null && (
            <IconButtonWithTip
              title={t('course.results.final-grade-preview')}
              onClick={() => {
                setGraphData(info.row.original);
                setGraphOpen(true);
              }}
              sx={{position: 'static', width: 24, height: 24}}
            >
              <AccountTree fontSize="small" />
            </IconButtonWithTip>
          )}
        </span>
      ),
    }),
    columnHelper.accessor(row => row.date, {
      header: t('general.date'),
      size: 100,
      getGroupingValue: row =>
        new Date(row.date).toLocaleDateString(),
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor(row => row.grader.name ?? row.grader.email, {
      header: t('general.grader'),
      size: 120,
    }),
    columnHelper.accessor(row => row.comment ?? '-', {
      header: t('general.comment'),
      size: 120,
    }),
    columnHelper.accessor(row => row.sisuExportDate, {
      id: 'Exported to Sisu',
      header: t('course.results.table.exported'),
      size: 80,
      meta: {PrettyChipPosition: 'last'},
      enableHiding: true,
      filterFn: (row, _columnId, filterValue) => {
        if (filterValue === 'hideExported') return row.original.sisuExportDate === null;
        return true;
      },
      getGroupingValue: row =>
        row.sisuExportDate !== null ? '✅' : '-',
      cell: info => (info.getValue() !== null ? '✅' : '-'),
    }),
    ...partColumns,
    ...taskColumns,
  ] as ReturnType<typeof columnHelper.accessor>[];

  const table = useTable({
    features: features,
    data: visibleRows,
    columns,
    defaultColumn: {size: 100},
    // Selection
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    // Grouping / Expanding
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    enableGrouping: true,
    enableSorting: true,
    autoResetExpanded: false,
    // Column Resizing
    columnResizeMode: 'onChange',
    globalFilterFn: (row, _columnId, filterValue) => {
      const value = String(filterValue).toLowerCase();
      return (
        row.original.user.studentNumber.toLowerCase().includes(value)
        || (row.original.user.name ?? '').toLowerCase().includes(value)
      );
    },
    state: {
      rowSelection,
      expanded,
      grouping,
      sorting,
      globalFilter,
    },
  });

  return (
    <FinalGradesTableContext.Provider
      // Putting this value inside a useMemo is buggy
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        table,
        selectedModel,
        setSelectedModel,
        modelOptions,
      }}
    >
      <FrozenGraphDialog
        open={graphOpen}
        onClose={() => setGraphOpen(false)}
        finalGrade={graphData}
      />
      {children}
    </FinalGradesTableContext.Provider>
  );
};
