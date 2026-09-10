// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Download} from '@mui/icons-material';
import {Box, Button, Fade, Tooltip, useTheme} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import SisuDownloadDialog from '@/components/course/course-results-view/SisuDownloadDialog';
import Search from '@/components/shared/Search';
import FilterMenuButton, {
  type FilterOption,
} from '@/components/shared/table/FilterMenuButton';
import GroupByButton, {type GroupByElement} from '@/components/shared/table/GroupByButton';
import {useTableSearch} from '@/components/shared/table/useTableSearch';
import {useFinalGradesTableContext} from '@/context/useFinalGradesTableContext';
import {useDeleteFinalGrades, useUndoSisuExportFinalGrades} from '@/hooks/useApi';

const FinalGradesToolbar = (): JSX.Element => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {courseId} = useParams() as {courseId: string};
  const {table, selectedModel, setSelectedModel, modelOptions} =
    useFinalGradesTableContext();
  const {searchValue, handleSearch, resetSearch} = useTableSearch(table);

  const deleteFinalGrades = useDeleteFinalGrades(courseId);
  const undoSisuExportFinalGrades = useUndoSisuExportFinalGrades(courseId);

  const [showSisuDialog, setShowSisuDialog] = useState(false);

  const extraGroups: GroupByElement[][] = [
    [
      {id: 'model', name: t('general.grading-model')},
      {id: 'finalGrade', name: t('general.final-grade')},
      {id: 'date', name: t('general.date')},
      {id: 'exportedToSisu', name: t('course.results.table.exported')},
    ],
  ];

  const modelFilterOptions: FilterOption[][] = [modelOptions];

  const selectedRows = table.getSelectedRowModel().rows;

  const handleUndoSisuExport = async (): Promise<void> => {
    const finalGradeIds = selectedRows
      .filter(row => row.original.sisuExportDate !== null)
      .map(row => row.original.id);
    if (finalGradeIds.length === 0) {
      enqueueSnackbar(t('final-grades-view.no-exported-selected'), {
        variant: 'info',
      });
      return;
    }
    const confirmation = await AsyncConfirmationModal({
      title: t('final-grades-view.undo-sisu-export'),
      message: t('final-grades-view.undo-sisu-export-confirm', {
        count: finalGradeIds.length,
      }),
      confirmButtonText: t('final-grades-view.undo-sisu-export'),
    });
    if (!confirmation) return;
    await undoSisuExportFinalGrades.mutateAsync(finalGradeIds);
    table.resetRowSelection();
    enqueueSnackbar(t('final-grades-view.sisu-export-undone'), {
      variant: 'success',
    });
  };

  const handleDeleteFinalGrades = async (): Promise<void> => {
    const finalGradeIds = selectedRows.map(row => row.original.id);
    if (finalGradeIds.length === 0) return;
    const confirmation = await AsyncConfirmationModal({
      title: t('final-grades-view.delete-final-grades'),
      message: t('final-grades-view.delete-final-grades-confirm', {
        count: finalGradeIds.length,
      }),
      confirmButtonText: t('general.delete'),
      confirmDelete: true,
    });
    if (!confirmation) return;
    await deleteFinalGrades.mutateAsync(finalGradeIds);
    table.resetRowSelection();
    enqueueSnackbar(t('final-grades-view.final-grades-deleted'), {
      variant: 'success',
    });
  };

  return (
    <>
      <SisuDownloadDialog
        open={showSisuDialog}
        onClose={() => setShowSisuDialog(false)}
        onExited={() => table.resetRowSelection()}
        selectedRows={selectedRows.map(row => ({
          user: row.original.user,
          courseTasks: [],
          finalGrades: [row.original],
        }))}
      />

      {selectedRows.length === 0
        ? (
            <Box sx={{p: 0.5, width: '700px'}} />
          )
        : (
            <Fade in>
              <Box
                sx={{
                  p: 0.5,
                  borderRadius: 3,
                  display: 'flex',
                  gap: 1,
                  backgroundColor: theme.palette.primary.light,
                  width: '700px',
                }}
              >
                <Button
                  variant="tonal"
                  onClick={() => setShowSisuDialog(true)}
                  startIcon={<Download />}
                  color="primary"
                >
                  {t('course.results.download-sisu-csv')}
                </Button>
                <Tooltip
                  title={t('final-grades-view.undo-sisu-export-hint')}
                  placement="top"
                >
                  <span>
                    <Button
                      variant="tonal"
                      onClick={() => void handleUndoSisuExport()}
                      color="primary"
                    >
                      {t('final-grades-view.undo-sisu-export')}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={t('final-grades-view.delete-final-grades-hint')}
                  placement="top"
                >
                  <span>
                    <Button
                      variant="tonal"
                      onClick={() => void handleDeleteFinalGrades()}
                      color="error"
                    >
                      {t('final-grades-view.delete-final-grades')}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Fade>
          )}

      <Box
        sx={{
          py: 1,
          borderRadius: 200,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip
          title={t('course.results.group-columns')}
          placement="top"
          disableInteractive
        >
          <GroupByButton table={table} extraGroups={extraGroups} />
        </Tooltip>
        {modelOptions.length > 1 && (
          <Tooltip
            title={t('final-grades-view.filter-by-model')}
            placement="top"
            disableInteractive
          >
            <FilterMenuButton
              label={t('general.grading-model')}
              selected={selectedModel !== 'any'}
              options={modelFilterOptions}
              selectedId={
                selectedModel === 'any'
                  ? undefined
                  : selectedModel === 'manual'
                    ? 'manual'
                    : selectedModel.modelId
              }
              onSelect={(id) => {
                setSelectedModel(id === 'manual' ? 'manual' : {modelId: Number(id)});
              }}
              onClear={() => setSelectedModel('any')}
            />
          </Tooltip>
        )}
        <Search
          value={searchValue}
          onChange={handleSearch}
          reset={resetSearch}
        />
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          {t('course.results.showing-n-rows', {
            n: table.getFilteredRowModel().rows.length,
          })}
          <Fade
            in={table.getPreFilteredRowModel().rows.some(
              row => row.original.sisuExportDate !== null
            )}
          >
            <Button
              sx={{
                color: theme.palette.success.main,
                fontWeight: '500',
                p: 0.5,
                px: 2,
                py: 0.5,
                borderRadius: 3,
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                height: '36px',
                boxSizing: 'border-box',
                border:
                  table.getColumn('exportedToSisu')?.getFilterValue() === 'hideExported'
                    ? `1px solid ${theme.palette.success.main}`
                    : 'none',
              }}
              onClick={() => {
                const currentFilter = table
                  .getColumn('exportedToSisu')
                  ?.getFilterValue();
                if (currentFilter === 'hideExported') {
                  table.getColumn('exportedToSisu')?.setFilterValue(undefined);
                } else {
                  table.getColumn('exportedToSisu')?.setFilterValue('hideExported');
                }
              }}
            >
              {t('course.results.hide-exported-sisu')}
            </Button>
          </Fade>
        </Box>
      </Box>
    </>
  );
};

export default FinalGradesToolbar;
