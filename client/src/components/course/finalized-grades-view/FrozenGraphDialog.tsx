// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import {type JSX, useMemo, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';

import type {GraphSource, GraphSourceValue} from '@/common/types';
import Graph from '@/components/shared/graph/Graph';
import type {FinalGradeRow} from '@/context/FinalGradesTableProvider';
import {bestFrozenGrade, frozenSourceIds} from '@/utils/frozen';

type PropsType = {
  open: boolean;
  onClose: () => void;
  finalGrade: FinalGradeRow | null;
};

/**
 * Read-only graph preview of a final grade, rendered entirely from the frozen
 * hard copy stored on the final grade. The final grading model is shown with
 * the course part grades as sources; each course part model can be selected to
 * see its task grades.
 */
const FrozenGraphDialog = ({
  open,
  onClose,
  finalGrade,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();

  const frozen = finalGrade?.frozenInfo ?? null;

  // Selectable models: the final model plus the course part models
  const models = useMemo(() => {
    if (frozen === null) return [];
    const list: {
      id: number;
      name: string;
      coursePartId: number | null;
      graphStructure: NonNullable<typeof frozen.gradingModel>['graphStructure'];
    }[] = [];
    if (frozen.gradingModel !== null) {
      list.push({
        id: frozen.gradingModel.id,
        name: frozen.gradingModel.name,
        coursePartId: null,
        graphStructure: frozen.gradingModel.graphStructure,
      });
    }
    for (const part of frozen.courseParts) {
      if (part.gradingModel === null) continue;
      list.push({
        id: part.gradingModel.id,
        name: `${part.name} — ${part.gradingModel.name}`,
        coursePartId: part.id,
        graphStructure: part.gradingModel.graphStructure,
      });
    }
    return list;
  }, [frozen]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected =
    models.find(model => model.id === selectedId) ?? models[0] ?? null;

  // Sources & values from the frozen data
  let sources: GraphSource[] = [];
  let sourceValues: GraphSourceValue[] = [];
  if (frozen !== null && selected !== null) {
    const sourceIds = frozenSourceIds(selected.graphStructure);
    if (selected.coursePartId === null) {
      // Final grade model: sources are the course parts
      sources = frozen.courseParts
        .filter(part => sourceIds.has(part.id))
        .map(part => ({
          id: part.id,
          name: part.name,
          archived: false,
          expiryDate: part.expiryDate === null ? null : new Date(part.expiryDate),
        }));
      sourceValues = sources.map(
        source => ({id: source.id, value: finalGrade!.partGrades[source.id] ?? 0})
      );
    } else {
      // Course part model: sources are the tasks of the part
      sources = frozen.tasks
        .filter(task => task.coursePartId === selected.coursePartId && sourceIds.has(task.id))
        .map(task => ({
          id: task.id,
          name: task.name,
          archived: false,
        }));
      sourceValues = sources.map((source) => {
        const task = frozen.tasks.find(t => t.id === source.id)!;
        return {id: source.id, value: bestFrozenGrade(task.grades) ?? 0};
      });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        {t('course.results.final-grade-preview')}
        {finalGrade?.user && (
          <>
            {', '}
            <Trans
              i18nKey={
                finalGrade.user.name
                  ? 'course.results.number-and-name'
                  : 'course.results.number-no-name'
              }
              components={{bold: <strong />}}
              values={{
                studentNumber: finalGrade.user.studentNumber,
                name: finalGrade.user.name,
              }}
            />
          </>
        )}
      </DialogTitle>
      <DialogContent>
        {finalGrade === null
          ? <>{t('course.results.data-undefined')}</>
          : frozen === null
            ? <>{t('final-grades-view.no-snapshot')}</>
            : selected === null
              ? <>{t('general.loading')}</>
              : (
                  <Graph
                    key={selected.id} // Reset graph for each model
                    initGraph={selected.graphStructure}
                    sources={sources}
                    sourceValues={sourceValues}
                    readOnly
                  />
                )}
      </DialogContent>
      <DialogActions>
        {models.length > 1 && (
          <FormControl size="small">
            <InputLabel id="frozen-model-select-label">
              {t('general.grading-model')}
            </InputLabel>
            <Select
              labelId="frozen-model-select-label"
              sx={{minWidth: '200px'}}
              value={selected?.id ?? models[0].id}
              label={t('general.grading-model')}
              onChange={(event) => {
                setSelectedId(event.target.value);
              }}
            >
              {models.map(model => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button onClick={onClose} variant="contained">
          {t('general.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FrozenGraphDialog;
