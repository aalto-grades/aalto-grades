// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ChevronRight} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {
  type ChangeEvent,
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {NewTaskGrade} from '@/common/types';
import ServiceTokenDialog from '@/components/shared/auth/ServiceTokenDialog';
import {
  useAddGrades,
  useGetCourseParts,
  useGetCourseTasks,
  useGetExtServiceGradesForServices,
} from '@/hooks/useApi';
import {SERVICE_SOURCE_OPTIONS, getServiceToken} from '@/utils';
import type {ServiceSourceOption} from '@/utils/servicesSource';

type PropsType = {
  open: boolean;
  onClose: () => void;
};

type SourceEntry = {
  id: string;
  label: string;
  courseTaskId: number;
  sourceKind: 'external';
  serviceId?: string;
};

type TaskEntry = {
  id: number;
  name: string;
  sources: SourceEntry[];
};

type PartEntry = {
  id: number;
  name: string;
  tasks: TaskEntry[];
};

type TaskListEntry = {
  partName: string;
  taskId: number;
  taskName: string;
  sources: SourceEntry[];
};

type SelectedTasks = {
  externalTaskIdsByService: Map<string, number[]>;
  externalTaskIdsByServiceRecord: Record<string, number[]>;
};

const ImportGradesDialog = ({
  open,
  onClose,
}: PropsType): JSX.Element | null => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};

  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const addGrades = useAddGrades(courseId);

  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [pendingImport, setPendingImport] = useState<boolean>(false);
  const [previewGrades, setPreviewGrades] = useState<NewTaskGrade[] | null>(null);

  const [serviceTokenDialogOpen, setServiceTokenDialogOpen] =
    useState<boolean>(false);
  const [serviceTokenInfo, setServiceTokenInfo] =
    useState<ServiceSourceOption | null>(null);

  const serviceOptions = SERVICE_SOURCE_OPTIONS;

  const serviceOptionMap = useMemo(() => {
    const map = new Map<string, ServiceSourceOption>();
    for (const option of serviceOptions) {
      map.set(option.id.toLowerCase(), option);
    }
    return map;
  }, [serviceOptions]);

  const externalSourceLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const task of courseTasks.data ?? []) {
      for (const source of task.externalSources ?? []) {
        const serviceId = source.externalServiceName.toLowerCase();
        const serviceLabel =
          serviceOptionMap.get(serviceId)?.label ?? source.externalServiceName;
        const sourceName = source.sourceInfo.itemname ?? '';
        map.set(source.id, `${serviceLabel}: ${sourceName}`);
      }
    }
    return map;
  }, [courseTasks.data, serviceOptionMap]);

  const getPreviewSourceLabel = useCallback(
    (row: NewTaskGrade): string =>
      row.externalSourceId
        ? externalSourceLabelById.get(row.externalSourceId) ?? '-'
        : '-',
    [externalSourceLabelById]
  );

  const parts = useMemo<PartEntry[]>(() => {
    if (!courseParts.data || !courseTasks.data) return [];

    const partMap = new Map<number, PartEntry>();
    for (const part of courseParts.data) {
      partMap.set(part.id, {id: part.id, name: part.name, tasks: []});
    }

    for (const task of courseTasks.data) {
      if (task.archived) continue;

      const sources: SourceEntry[] = [];
      const externalSources = task.externalSources ?? [];
      for (const source of externalSources) {
        const serviceId = source.externalServiceName.toLowerCase();
        const serviceLabel =
          serviceOptionMap.get(serviceId)?.label ?? source.externalServiceName;
        const sourceName = source.sourceInfo.itemname ?? '';
        sources.push({
          id: `ext:${serviceId}:${source.id}`,
          label: `${serviceLabel}: ${sourceName}`,
          courseTaskId: task.id,
          sourceKind: 'external',
          serviceId,
        });
      }

      if (sources.length === 0) continue;

      const partEntry = partMap.get(task.coursePartId) ?? {
        id: task.coursePartId,
        name: t('general.course-part'),
        tasks: [],
      };
      partEntry.tasks.push({id: task.id, name: task.name, sources});
      partMap.set(task.coursePartId, partEntry);
    }

    return Array.from(partMap.values()).filter(part => part.tasks.length > 0);
  }, [courseParts.data, courseTasks.data, serviceOptionMap, t]);

  const taskList = useMemo<TaskListEntry[]>(() =>
    parts.flatMap(part =>
      part.tasks.map(task => ({
        partName: part.name,
        taskId: task.id,
        taskName: task.name,
        sources: task.sources,
      }))
    ),
  [parts]);

  const sourcesByTaskId = useMemo(() => {
    const map = new Map<number, SourceEntry[]>();
    for (const entry of taskList) {
      map.set(entry.taskId, entry.sources);
    }
    return map;
  }, [taskList]);

  const selectedTaskSet = useMemo(
    () => new Set(selectedTaskIds),
    [selectedTaskIds]
  );

  const toggleTasks = (taskIds: number[], checked: boolean): void => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      for (const taskId of taskIds) {
        if (checked) next.add(taskId);
        else next.delete(taskId);
      }
      return Array.from(next);
    });
  };

  const getServiceOption = useCallback(
    (serviceId: string): ServiceSourceOption =>
      serviceOptionMap.get(serviceId) ?? {
        id: serviceId,
        label: serviceId,
        tokenLink: '',
      },
    [serviceOptionMap]
  );

  const selectedTasksByService = useMemo<SelectedTasks>(() => {
    const externalTaskIdSetsByService = new Map<string, Set<number>>();

    for (const taskId of selectedTaskIds) {
      const sources = sourcesByTaskId.get(taskId) ?? [];
      for (const source of sources) {
        if (!source.serviceId) continue;

        if (!externalTaskIdSetsByService.has(source.serviceId)) {
          externalTaskIdSetsByService.set(source.serviceId, new Set());
        }
        externalTaskIdSetsByService
          .get(source.serviceId)!
          .add(source.courseTaskId);
      }
    }

    const externalTaskIdsByService = new Map<string, number[]>();
    for (const [serviceId, taskIdSet] of externalTaskIdSetsByService) {
      externalTaskIdsByService.set(serviceId, Array.from(taskIdSet));
    }

    const externalTaskIdsByServiceRecord = Object.fromEntries(
      Array.from(externalTaskIdsByService.entries())
    ) as Record<string, number[]>;

    return {
      externalTaskIdsByService,
      externalTaskIdsByServiceRecord,
    };
  }, [selectedTaskIds, sourcesByTaskId]);

  const gradeQueries = useGetExtServiceGradesForServices(
    courseId,
    selectedTasksByService.externalTaskIdsByServiceRecord,
    serviceOptions,
    {enabled: false}
  );

  const gradeQueryByServiceId = useMemo(
    () => new Map(
      serviceOptions.map((serviceInfo, index) => [serviceInfo.id, gradeQueries[index]])
    ),
    [gradeQueries, serviceOptions]
  );

  const ensureTokens = useCallback(
    ({externalTaskIdsByService}: SelectedTasks): boolean => {
      for (const [serviceId] of externalTaskIdsByService) {
        if (!getServiceToken(serviceId)) {
          setServiceTokenInfo(getServiceOption(serviceId));
          setServiceTokenDialogOpen(true);
          setPendingImport(true);
          return false;
        }
      }

      return true;
    },
    [getServiceOption]
  );

  const fetchGrades = useCallback(
    async ({externalTaskIdsByService}: SelectedTasks): Promise<NewTaskGrade[]> => {
      const responses: NewTaskGrade[][] = [];

      for (const [serviceId] of externalTaskIdsByService) {
        const query = gradeQueryByServiceId.get(serviceId);
        if (!query) continue;
        const result = await query.refetch();
        responses.push(result.data ?? []);
      }

      return responses.flat();
    },
    [gradeQueryByServiceId]
  );

  const handleFetchGrades = useCallback(async (): Promise<void> => {
    if (selectedTaskIds.length === 0) return;

    const selectedTasks = selectedTasksByService;
    if (!ensureTokens(selectedTasks)) return;

    try {
      setIsImporting(true);
      const allGrades = await fetchGrades(selectedTasks);

      if (allGrades.length === 0) {
        enqueueSnackbar(t('course.results.no-service-grades'), {
          variant: 'warning',
        });
        return;
      }

      setPreviewGrades(allGrades);
    } finally {
      setIsImporting(false);
    }
  }, [
    ensureTokens,
    fetchGrades,
    selectedTasksByService,
    selectedTaskIds.length,
    t,
  ]);

  const handleSubmit = async (): Promise<void> => {
    if (!previewGrades || previewGrades.length === 0) return;
    await addGrades.mutateAsync(previewGrades);
    enqueueSnackbar(t('course.results.grades-saved'), {variant: 'success'});
    onClose();
  };

  useEffect(() => {
    if (!pendingImport) return;
    setPendingImport(false);
    void handleFetchGrades();
  }, [handleFetchGrades, pendingImport]);

  useEffect(() => {
    if (open) return;
    setSelectedTaskIds([]);
    setIsImporting(false);
    setPendingImport(false);
    setServiceTokenDialogOpen(false);
    setServiceTokenInfo(null);
    setPreviewGrades(null);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {previewGrades
            ? t('course.results.confirm-service-grades', {
                count: previewGrades.length,
                service: t('general.grade-sources'),
              })
            : t('course.parts.select-grade-sources')}
        </DialogTitle>
        <DialogContent>
          {isImporting && (
            <Box sx={{mb: 2}}>
              <Typography>{t('course.parts.fetching-grades')}</Typography>
              <LinearProgress sx={{mt: 1}} />
            </Box>
          )}

          {!isImporting && !previewGrades && parts.length === 0 && (
            <Typography>{t('course.results.no-service-sources')}</Typography>
          )}

          {!isImporting && !previewGrades && taskList.length > 0 && (
            <List dense disablePadding>
              {taskList.map(entry => (
                <ListItem key={entry.taskId} alignItems="flex-start" disablePadding>
                  <ListItemButton
                    onClick={() =>
                      toggleTasks([entry.taskId], !selectedTaskSet.has(entry.taskId))}
                    sx={{
                      alignItems: 'flex-start',
                      bgcolor: selectedTaskSet.has(entry.taskId)
                        ? 'action.selected'
                        : 'transparent',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: selectedTaskSet.has(entry.taskId)
                          ? 'action.selected'
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={(
                        <FormControlLabel
                          control={(
                            <Checkbox
                              checked={selectedTaskSet.has(entry.taskId)}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                toggleTasks([entry.taskId], event.target.checked)}
                              onClick={event => event.stopPropagation()}
                            />
                          )}
                          label={(
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                              <Typography>{entry.partName}</Typography>
                              <ChevronRight fontSize="small" />
                              <Typography>{entry.taskName}</Typography>
                            </Box>
                          )}
                        />
                      )}
                      secondary={(
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {entry.sources.map(source => (
                            <Chip key={source.id} label={source.label} size="small" />
                          ))}
                        </Stack>
                      )}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {!isImporting && previewGrades && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('general.student-number')}</TableCell>
                    <TableCell>{t('general.course-task')}</TableCell>
                    <TableCell>{t('general.source-name')}</TableCell>
                    <TableCell>{t('general.grade')}</TableCell>
                    <TableCell>{t('general.date')}</TableCell>
                    <TableCell>{t('general.expiry-date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewGrades.map(row => (
                    <TableRow key={`${row.studentNumber}-${row.courseTaskId}-${row.date.toISOString()}`}>
                      <TableCell>{row.studentNumber}</TableCell>
                      <TableCell>
                        {courseTasks.data?.find(task => task.id === row.courseTaskId)?.name ?? row.courseTaskId}
                      </TableCell>
                      <TableCell>{getPreviewSourceLabel(row)}</TableCell>
                      <TableCell>{row.grade}</TableCell>
                      <TableCell>{row.date.toDateString()}</TableCell>
                      <TableCell>
                        {row.expiryDate ? row.expiryDate.toDateString() : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          {previewGrades
            ? (
                <>
                  <Button
                    onClick={() => setPreviewGrades(null)}
                    disabled={isImporting}
                  >
                    {t('general.back')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isImporting}
                  >
                    {t('general.submit')}
                  </Button>
                </>
              )
            : (
                <>
                  <Button onClick={onClose} disabled={isImporting}>
                    {t('general.close')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => void handleFetchGrades()}
                    disabled={selectedTaskIds.length === 0 || isImporting}
                  >
                    {t('general.import')}
                  </Button>
                </>
              )}
        </DialogActions>
      </Dialog>

      {serviceTokenInfo && (
        <ServiceTokenDialog
          open={serviceTokenDialogOpen}
          onClose={() => {
            setServiceTokenDialogOpen(false);
            setPendingImport(false);
          }}
          onSubmit={() => {
            setServiceTokenDialogOpen(false);
            setPendingImport(true);
          }}
          serviceInfo={serviceTokenInfo}
        />
      )}
    </>
  );
};

export default ImportGradesDialog;
