// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Add,
  CloudUpload,
  DeleteOutline,
  DoneAll,
  EditNote,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {DataGrid, type GridColDef, type GridRowSelectionModel} from '@mui/x-data-grid';
import dayjs, {type Dayjs} from 'dayjs';
import {enqueueSnackbar} from 'notistack';
import {type ChangeEvent, type JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';

import {SystemRole} from '@/common/types';
import LocalizedDatePicker from '@/components/shared/LocalizedDatePicker';
import SaveBar from '@/components/shared/SaveBar';
import Search from '@/components/shared/Search';
import StyledDataGrid from '@/components/shared/StyledDataGrid';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  useAddWaitListEntries,
  useDeleteWaitListEntries,
  useEditWaitListEntries,
  useGetCourseTasks,
  useGetWaitList,
  useImportWaitListEntries,
  useReleaseWaitListEntries,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import type {Numeric} from '@/types';
import type {
  EditWaitListEntry,
  NewWaitListEntry,
  WaitListImportEntry,
  WaitListRelease,
  WaitListStatus,
} from '@/types/waitList';
import {WaitListStatus as WaitListStatusValues} from '@/types/waitList';

type WaitListRow = {
  id: number;
  studentNumber: string;
  name: string | null;
  reason: string | null;
  dateAdded: Date;
  dateResolved: Date | null;
  status: WaitListStatus;
};

const statusColor = (status: WaitListStatus):
  | 'default'
  | 'warning'
  | 'success'
  | 'error' => {
  switch (status) {
    case WaitListStatusValues.Pending:
      return 'warning';
    case WaitListStatusValues.Passed:
      return 'success';
    case WaitListStatusValues.Failed:
      return 'error';
  }
};

const formatStatus = (
  t: (key: string) => string,
  status: WaitListStatus
): string => {
  switch (status) {
    case WaitListStatusValues.Pending:
      return t('wait-list.status.pending');
    case WaitListStatusValues.Passed:
      return t('wait-list.status.passed');
    case WaitListStatusValues.Failed:
      return t('wait-list.status.failed');
  }
};

const isSameDate = (
  left: Date | string | null,
  right: Date | string | null
): boolean => {
  const leftDate = left ? new Date(left) : null;
  const rightDate = right ? new Date(right) : null;
  if (leftDate === null && rightDate === null) return true;
  if (leftDate === null || rightDate === null) return false;
  return leftDate.getTime() === rightDate.getTime();
};

type AddWaitListEntryDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onSubmit: (entry: NewWaitListEntry) => Promise<void>;
}>;

const AddWaitListEntryDialog = ({
  open,
  onClose: onCloseCallback,
  onSubmit,
}: AddWaitListEntryDialogProps): JSX.Element => {
  const {t} = useTranslation();
  const [studentNumber, setStudentNumber] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<WaitListStatus>(
    WaitListStatusValues.Pending
  );
  const [dateAdded, setDateAdded] = useState<Dayjs>(dayjs());
  const [dateResolved, setDateResolved] = useState<Dayjs | null>(null);

  const reset = (): void => {
    setStudentNumber('');
    setReason('');
    setStatus(WaitListStatusValues.Pending);
    setDateAdded(dayjs());
    setDateResolved(null);
  };

  const onClose = (): void => {
    reset();
    onCloseCallback();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!studentNumber) return;
    await onSubmit({
      studentNumber,
      reason: reason || null,
      status,
      dateAdded: dateAdded.toDate(),
      dateResolved: status === WaitListStatusValues.Pending
        ? null
        : dateResolved?.toDate() ?? null,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('wait-list.add-entry')}</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2,}}>
        Add one student to the waitlist
        <TextField
          label={t('general.student-number')}
          value={studentNumber}
          onChange={e => setStudentNumber(e.target.value)}
          required
        />
        <TextField
          label={t('wait-list.reason')}
          value={reason}
          onChange={e => setReason(e.target.value)}
          multiline
          minRows={2}
        />
        <FormControl fullWidth>
          <InputLabel id="wait-list-status-label">
            {t('wait-list.status.label')}
          </InputLabel>
          <Select
            labelId="wait-list-status-label"
            value={status}
            label={t('wait-list.status.label')}
            onChange={e => setStatus(e.target.value as WaitListStatus)}
          >
            <MenuItem value={WaitListStatusValues.Pending}>
              {t('wait-list.status.pending')}
            </MenuItem>
            <MenuItem value={WaitListStatusValues.Passed}>
              {t('wait-list.status.passed')}
            </MenuItem>
            <MenuItem value={WaitListStatusValues.Failed}>
              {t('wait-list.status.failed')}
            </MenuItem>
          </Select>
        </FormControl>
        <LocalizedDatePicker
          label={t('wait-list.date-added')}
          value={dateAdded}
          onChange={value => value && setDateAdded(value)}
        />
        <LocalizedDatePicker
          label={t('wait-list.date-resolved')}
          value={dateResolved}
          onChange={value => setDateResolved(value)}
          disabled={status === WaitListStatusValues.Pending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('general.cancel')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!studentNumber}
        >
          {t('general.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type BulkEditWaitListDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  selectedRows: WaitListRow[];
  onSubmit: (updates: EditWaitListEntry[]) => Promise<void>;
}>;

const BulkEditWaitListDialog = ({
  open,
  onClose,
  selectedRows,
  onSubmit,
}: BulkEditWaitListDialogProps): JSX.Element => {
  const {t} = useTranslation();
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<WaitListStatus | 'unchanged'>(
    'unchanged'
  );
  const [dateAdded, setDateAdded] = useState<Dayjs | null>(null);
  const [dateResolved, setDateResolved] = useState<Dayjs | null>(null);

  const reset = (): void => {
    setReason('');
    setStatus('unchanged');
    setDateAdded(null);
    setDateResolved(null);
  };

  const handleSubmit = async (): Promise<void> => {
    const updates: EditWaitListEntry[] = selectedRows.map(row => ({
      id: row.id,
      reason: reason || undefined,
      status: status === 'unchanged' ? undefined : status,
      dateAdded: dateAdded ? dateAdded.toDate() : undefined,
      dateResolved: dateResolved ? dateResolved.toDate() : undefined,
    }));
    await onSubmit(updates);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('wait-list.bulk-update')}</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <TextField
          label={t('wait-list.reason')}
          value={reason}
          onChange={e => setReason(e.target.value)}
          helperText={t('wait-list.bulk-update-hint')}
        />
        <FormControl fullWidth>
          <InputLabel id="wait-list-bulk-status">
            {t('wait-list.status.label')}
          </InputLabel>
          <Select
            labelId="wait-list-bulk-status"
            value={status}
            label={t('wait-list.status.label')}
            onChange={e =>
              setStatus(e.target.value as WaitListStatus | 'unchanged')}
          >
            <MenuItem value="unchanged">{t('general.no-change')}</MenuItem>
            <MenuItem value={WaitListStatusValues.Pending}>
              {t('wait-list.status.pending')}
            </MenuItem>
            <MenuItem value={WaitListStatusValues.Passed}>
              {t('wait-list.status.passed')}
            </MenuItem>
            <MenuItem value={WaitListStatusValues.Failed}>
              {t('wait-list.status.failed')}
            </MenuItem>
          </Select>
        </FormControl>
        <LocalizedDatePicker
          label={t('wait-list.date-added')}
          value={dateAdded}
          onChange={value => setDateAdded(value)}
        />
        <LocalizedDatePicker
          label={t('wait-list.date-resolved')}
          value={dateResolved}
          onChange={value => setDateResolved(value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('general.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {t('general.update')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type ReleaseWaitListDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  selectedIds: number[];
  courseTasks: {id: number; name: string; archived: boolean}[];
  onSubmit: (data: WaitListRelease) => Promise<void>;
}>;

const ReleaseWaitListDialog = ({
  open,
  onClose,
  selectedIds,
  courseTasks,
  onSubmit,
}: ReleaseWaitListDialogProps): JSX.Element => {
  const {t} = useTranslation();
  const [status, setStatus] = useState<WaitListStatus>(
    WaitListStatusValues.Passed
  );
  const [dateResolved, setDateResolved] = useState<Dayjs>(dayjs());
  const [addManualGrade, setAddManualGrade] = useState(false);
  const [courseTaskId, setCourseTaskId] = useState<Numeric | null>(null);
  const [grade, setGrade] = useState<number | ''>('');
  const [comment, setComment] = useState('');

  const availableTasks = courseTasks.filter(task => !task.archived);

  const handleSubmit = async (): Promise<void> => {
    const payload: WaitListRelease = {
      entryIds: selectedIds,
      status,
      dateResolved: dateResolved.toDate(),
      manualGrade: addManualGrade && courseTaskId !== null && grade !== ''
        ? {
            courseTaskId: Number(courseTaskId),
            grade: Number(grade),
            comment: comment || null,
          }
        : null,
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('wait-list.release')}</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <FormControl fullWidth>
          <InputLabel id="wait-list-release-status">
            {t('wait-list.status.label')}
          </InputLabel>
          <Select
            labelId="wait-list-release-status"
            value={status}
            label={t('wait-list.status.label')}
            onChange={e => setStatus(e.target.value as WaitListStatus)}
          >
            <MenuItem value={WaitListStatusValues.Passed}>
              {t('wait-list.status.passed')}
            </MenuItem>
            <MenuItem value={WaitListStatusValues.Failed}>
              {t('wait-list.status.failed')}
            </MenuItem>
          </Select>
        </FormControl>
        <LocalizedDatePicker
          label={t('wait-list.date-resolved')}
          value={dateResolved}
          onChange={value => value && setDateResolved(value)}
        />
        <FormControlLabel
          control={(
            <Switch
              checked={addManualGrade}
              onChange={e => setAddManualGrade(e.target.checked)}
            />
          )}
          label={t('wait-list.add-manual-grade')}
        />
        {addManualGrade && (
          <>
            <FormControl fullWidth>
              <InputLabel id="wait-list-course-task">
                {t('wait-list.manual-grade-task')}
              </InputLabel>
              <Select
                labelId="wait-list-course-task"
                value={courseTaskId ?? ''}
                label={t('wait-list.manual-grade-task')}
                onChange={e => setCourseTaskId(Number(e.target.value))}
              >
                {availableTasks.map(task => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('wait-list.manual-grade-value')}
              type="number"
              value={grade}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setGrade(value === '' ? '' : Number(value));
              }}
            />
            <TextField
              label={t('general.comment')}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('general.cancel')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={selectedIds.length === 0}
        >
          {t('general.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type ImportWaitListDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onSubmit: (entries: WaitListImportEntry[]) => Promise<void>;
}>;

const ImportWaitListDialog = ({
  open,
  onClose,
  onSubmit,
}: ImportWaitListDialogProps): JSX.Element => {
  const {t} = useTranslation();
  const [rows, setRows] = useState<WaitListImportEntry[]>([]);

  const parseDate = (value: string): Date | null => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const parseStatus = (value: string): WaitListStatus | null => {
    const normalized = value.trim().toUpperCase();
    return Object.values(WaitListStatusValues).includes(normalized as WaitListStatus)
      ? (normalized as WaitListStatus)
      : null;
  };

  const readFileAsCsv = async (file: File): Promise<string> => {
    const text = await file.arrayBuffer();
    const {read, utils} = await import('xlsx');
    const workbook = read(text);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return utils.sheet_to_csv(sheet);
  };

  const getHeaderIndex = (header: string[], key: string): number =>
    header.indexOf(key);

  const resolveHeader = (headerLine: string): null | {
    studentIndex: number;
    entryIdIndex: number;
    reasonIndex: number;
    statusIndex: number;
    dateAddedIndex: number;
    dateResolvedIndex: number;
  } => {
    const header = headerLine.split(',').map(h => h.trim().toLowerCase());
    const studentIndex = [
      getHeaderIndex(header, 'studentnumber'),
      getHeaderIndex(header, 'student_number'),
      getHeaderIndex(header, 'studentno'),
    ].find(index => index >= 0) ?? -1;

    if (studentIndex < 0) {
      enqueueSnackbar(t('wait-list.import-missing-student'), {variant: 'error'});
      return null;
    }

    return {
      studentIndex,
      entryIdIndex: getHeaderIndex(header, 'entryid'),
      reasonIndex: getHeaderIndex(header, 'reason'),
      statusIndex: getHeaderIndex(header, 'status'),
      dateAddedIndex: getHeaderIndex(header, 'dateadded'),
      dateResolvedIndex: getHeaderIndex(header, 'dateresolved'),
    };
  };

  const parseEntry = (
    line: string,
    indices: ReturnType<typeof resolveHeader>
  ): WaitListImportEntry | null => {
    if (!indices) return null;
    const cols = line.split(',');
    const studentNumber = cols[indices.studentIndex]?.trim();
    if (!studentNumber) return null;

    const entryIdValue = indices.entryIdIndex >= 0
      ? cols[indices.entryIdIndex]?.trim()
      : '';
    const entryId = entryIdValue ? Number(entryIdValue) : null;

    const reason = indices.reasonIndex >= 0 ? cols[indices.reasonIndex]?.trim() : '';
    const statusValue = indices.statusIndex >= 0
      ? cols[indices.statusIndex]?.trim()
      : '';
    const dateAddedValue = indices.dateAddedIndex >= 0
      ? cols[indices.dateAddedIndex]?.trim()
      : '';
    const dateResolvedValue = indices.dateResolvedIndex >= 0
      ? cols[indices.dateResolvedIndex]?.trim()
      : '';

    return {
      entryId: Number.isNaN(entryId as number) ? null : entryId,
      studentNumber,
      reason: reason || null,
      status: statusValue ? parseStatus(statusValue) : null,
      dateAdded: dateAddedValue ? parseDate(dateAddedValue) : null,
      dateResolved: dateResolvedValue ? parseDate(dateResolvedValue) : null,
    };
  };

  const handleFile = async (file: File): Promise<void> => {
    const csv = await readFileAsCsv(file);
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    const headerIndices = resolveHeader(lines[0]);
    if (!headerIndices) return;

    const parsedRows = lines
      .slice(1)
      .map(line => parseEntry(line, headerIndices))
      .filter((entry): entry is WaitListImportEntry => entry !== null);

    setRows(parsedRows);
  };

  const handleSubmit = async (): Promise<void> => {
    if (rows.length === 0) return;
    await onSubmit(rows);
    setRows([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('wait-list.import')}</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <Typography>{t('wait-list.import-hint')}</Typography>
        <TextField
          type="file"
          slotProps={{input: {inputProps: {accept: '.csv,.xlsx,.xls'}}}}
          onChange={(event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Box sx={{height: 260}}>
          <DataGrid
            rows={rows.map((row, idx) => ({id: idx, ...row}))}
            columns={[
              {field: 'studentNumber', headerName: t('general.student-number'), width: 160},
              {field: 'reason', headerName: t('wait-list.reason'), width: 180},
              {field: 'status', headerName: t('wait-list.status.label'), width: 120},
            ]}
            hideFooter
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('general.cancel')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={rows.length === 0}
        >
          {t('general.import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WaitListView = (): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge, isAssistant} = useAuth();

  const waitList = useGetWaitList(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const addWaitListEntries = useAddWaitListEntries(courseId);
  const deleteWaitListEntries = useDeleteWaitListEntries(courseId);
  const editWaitListEntries = useEditWaitListEntries(courseId);
  const importWaitListEntries = useImportWaitListEntries(courseId);
  const releaseWaitListEntries = useReleaseWaitListEntries(courseId);

  const [rows, setRows] = useState<WaitListRow[]>([]);
  const [initRows, setInitRows] = useState<WaitListRow[]>([]);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({type: 'include', ids: new Set()});
  const [searchValue, setSearchValue] = useState('');
  const [filterModel, setFilterModel] = useState({
    items: [],
    quickFilterValues: [] as string[],
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const editRights =
    auth?.role === SystemRole.Admin || isTeacherInCharge || isAssistant;

  const [oldWaitListData, setOldWaitListData] =
    useState<typeof waitList.data>(undefined);
  if (waitList.data !== oldWaitListData) {
    setOldWaitListData(waitList.data);
    const newRows = (waitList.data ?? []).map(entry => ({
      id: entry.id,
      studentNumber: entry.user.studentNumber,
      name: entry.user.name,
      reason: entry.reason,
      dateAdded: new Date(entry.dateAdded),
      dateResolved: entry.dateResolved ? new Date(entry.dateResolved) : null,
      status: entry.status,
    }));
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  }

  const changedRows = useMemo(() => {
    const initById = new Map(initRows.map(row => [row.id, row]));
    return rows.filter((row) => {
      const initRow = initById.get(row.id);
      if (!initRow) return true;
      return (
        row.reason !== initRow.reason
        || !isSameDate(row.dateAdded, initRow.dateAdded)
        || !isSameDate(row.dateResolved, initRow.dateResolved)
        || row.status !== initRow.status
      );
    });
  }, [initRows, rows]);

  const unsavedChanges = useMemo(
    () => changedRows.length > 0,
    [changedRows.length]
  );

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      unsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (unsavedChanges) event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsavedChanges]);

  const selectedRows = useMemo(() => {
    const selectionIds = new Set(Array.from(rowSelectionModel.ids).map(Number));
    return rowSelectionModel.type === 'include'
      ? rows.filter(row => selectionIds.has(row.id))
      : rows.filter(row => !selectionIds.has(row.id));
  }, [rowSelectionModel, rows]);

  const statusOptions = [
    WaitListStatusValues.Pending,
    WaitListStatusValues.Passed,
    WaitListStatusValues.Failed,
  ];

  const columns: GridColDef<WaitListRow>[] = [
    {
      field: 'studentNumber',
      headerName: t('general.student-number'),
      type: 'string',
      width: 160,
      editable: false,
    },
    {
      field: 'name',
      headerName: t('general.name'),
      type: 'string',
      width: 220,
      editable: false,
      valueGetter: (value: string | null) => value ?? '-',
    },
    {
      field: 'reason',
      headerName: t('wait-list.reason'),
      type: 'string',
      width: 240,
      editable: editRights,
    },
    {
      field: 'dateAdded',
      headerName: t('wait-list.date-added'),
      type: 'date',
      width: 150,
      editable: editRights,
    },
    {
      field: 'dateResolved',
      headerName: t('wait-list.date-resolved'),
      type: 'date',
      width: 160,
      editable: editRights,
      valueGetter: (value: Date | null) => value,
    },
    {
      field: 'status',
      headerName: t('wait-list.status.label'),
      type: 'singleSelect',
      width: 160,
      editable: false,
      valueOptions: statusOptions,
      renderCell: params => (
        <Chip
          size="small"
          color={statusColor(params.value as WaitListStatus)}
          label={formatStatus(t, params.value as WaitListStatus)}
        />
      ),
      valueFormatter: value => formatStatus(t, value as WaitListStatus),
    },
  ];

  const handleSave = async (): Promise<void> => {
    if (changedRows.length === 0) return;
    const updates: EditWaitListEntry[] = changedRows.map(row => ({
      id: row.id,
      reason: row.reason,
      dateAdded: row.dateAdded,
      dateResolved: row.dateResolved,
      status: row.status,
    }));

    await editWaitListEntries.mutateAsync(updates);
    enqueueSnackbar(t('wait-list.updated'), {variant: 'success'});
  };

  const handleReset = (): void => {
    setRows(structuredClone(initRows));
  };

  const handleSearch = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const value = event.target.value;
    setSearchValue(value);
    setFilterModel({
      items: [],
      quickFilterValues: value ? [value] : [],
    });
  };

  const resetSearch = (): void => {
    setSearchValue('');
    setFilterModel({items: [], quickFilterValues: []});
  };

  const handleAddEntry = async (entry: NewWaitListEntry): Promise<void> => {
    await addWaitListEntries.mutateAsync([entry]);
    enqueueSnackbar(t('wait-list.added'), {variant: 'success'});
  };

  const handleImportEntries = async (
    entries: WaitListImportEntry[]
  ): Promise<void> => {
    await importWaitListEntries.mutateAsync(entries);
    enqueueSnackbar(t('wait-list.imported'), {variant: 'success'});
  };

  const handleReleaseEntries = async (data: WaitListRelease): Promise<void> => {
    await releaseWaitListEntries.mutateAsync(data);
    enqueueSnackbar(t('wait-list.released'), {variant: 'success'});
  };

  const handleRemoveEntries = async (): Promise<void> => {
    const selectedIds = selectedRows.map(row => row.id);
    if (selectedIds.length === 0) return;
    const confirmation = await AsyncConfirmationModal({
      title: t('wait-list.remove'),
      message: t('wait-list.remove-confirm', {count: selectedIds.length}),
      confirmButtonText: t('general.remove'),
      confirmDelete: true,
    });

    if (!confirmation) return;
    await deleteWaitListEntries.mutateAsync(selectedIds);
    enqueueSnackbar(t('wait-list.removed'), {variant: 'success'});
  };

  return (
    <Box textAlign="left" alignItems="left">
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <Typography width="fit-content" variant="h2">
          {t('wait-list.title')}
        </Typography>
        {editRights && (
          <SaveBar
            show={unsavedChanges}
            handleSave={handleSave}
            handleDiscard={handleReset}
          />
        )}
      </Box>
      <UnsavedChangesDialog blocker={blocker} handleDiscard={handleReset} />
      <Stack direction="row" spacing={1} sx={{my: 2}}>
        {editRights && (
          <>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialogOpen(true)}
            >
              {t('wait-list.add-entry')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => setImportDialogOpen(true)}
            >
              {t('wait-list.import')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditNote />}
              onClick={() => setBulkEditDialogOpen(true)}
              disabled={selectedRows.length === 0}
            >
              {t('wait-list.bulk-update')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DoneAll />}
              onClick={() => setReleaseDialogOpen(true)}
              disabled={selectedRows.length === 0}
            >
              {t('wait-list.release')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutline />}
              onClick={handleRemoveEntries}
              disabled={selectedRows.length === 0}
            >
              {t('wait-list.remove')}
            </Button>
          </>
        )}
        <Search value={searchValue} onChange={handleSearch} reset={resetSearch} />
      </Stack>

      <Box sx={{height: '70vh'}}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowHeight={30}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={setRowSelectionModel}
          rowSelectionModel={rowSelectionModel}
          filterModel={filterModel}
          processRowUpdate={(updatedRow: WaitListRow) => {
            setRows(oldRows =>
              oldRows.map(row => (row.id === updatedRow.id ? updatedRow : row))
            );
            return updatedRow;
          }}
        />
      </Box>

      <AddWaitListEntryDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddEntry}
      />
      <BulkEditWaitListDialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        selectedRows={selectedRows}
        onSubmit={async (updates) => {
          await editWaitListEntries.mutateAsync(updates);
          enqueueSnackbar(t('wait-list.updated'), {variant: 'success'});
        }}
      />
      <ReleaseWaitListDialog
        open={releaseDialogOpen}
        onClose={() => setReleaseDialogOpen(false)}
        selectedIds={selectedRows.map(row => row.id)}
        courseTasks={courseTasks.data ?? []}
        onSubmit={handleReleaseEntries}
      />
      <ImportWaitListDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSubmit={handleImportEntries}
      />
    </Box>
  );
};

export default WaitListView;
