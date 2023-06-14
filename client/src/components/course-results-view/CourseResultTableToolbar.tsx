// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import MenuButton from '../course-view/MenuButton';
import FileLoadDialog from '../course-view/FileLoadDialog';
import SisuExportDialog from './SisuExportDialog';
import AlertSnackbar from '../alerts/AlertSnackbar';
import gradesService from '../../services/grades';

const CourseResultsTableToolbar = (
  { search, setSearch, calculateFinalGrades, updateGrades }
): JSX.Element => {
  let { courseId, instanceId }: any = useParams();

  const [snackPack, setSnackPack] = useState<any>([]);
  const [alertOpen, setAlertOpen] = useState<any>(false);
  const [messageInfo, setMessageInfo] = useState<any>(undefined);

  const [showFileDialog, setShowFileDialog] = useState<boolean>(false);
  const [showSisuDialog, setShowSisuDialog] = useState<boolean>(false);

  const actionOptions = [
    { description: 'Import from file', handleClick: () => setShowFileDialog(true) },
    { description: 'Import from A+', handleClick: () => {} }
  ];

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  });

  function handleCloseFileDialog(): void {
    setShowFileDialog(false);
  }

  function handleCloseSisuDialog(): void {
    setShowSisuDialog(false);
  }

  async function downloadCsvTemplate(): Promise<void> {
    setSnackPack((prev) => [...prev, {
      msg: 'Downloading CSV template',
      severity: 'info'
    }]);

    try {
      const res = await gradesService.downloadCsvTemplate(courseId, instanceId);

      const blob = new Blob([res.data], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'template.csv'; // TODO: Get filename from Content-Disposition
      link.click();

      setSnackPack((prev) => [...prev, {
        msg: 'CSV template downloaded successfully.',
        severity: 'success'
      }]);
    } catch (e) {
      console.log(e);
      setSnackPack((prev) => [...prev, {
        msg: 'Downloading CSV template failed. Make sure there are attainments in the instance.',
        severity: 'error'
      }]);
    } finally {
      setAlertOpen(false);
    }
  }

  return (
    <>
      <Toolbar
        sx={{
          mx: 1,
          pt: 2,
        }}
      >
        <Box sx={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', width: '100%'
        }}>
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
            <TextField
              size='small'
              type='strig'
              value={search}
              name='search'
              label='Search by Student Number'
              onChange={({ target }) => setSearch(target.value)}
              InputLabelProps={{ shrink: true }}
              margin='normal'
            />
            <Tooltip title="Filter" >
              <IconButton size='large' sx={{ m: 1.5, mb: 1, mr: 0 }}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download results" >
              <IconButton size='large' sx={{ m: 1, mt: 1.5, ml: 0 }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start',
            alignItems: 'center', gap: 2
          }}>
            <Button variant='outlined' onClick={() => setShowSisuDialog(true)}>
              Export to Sisu CSV
            </Button>
            <Button variant='outlined' onClick={() => calculateFinalGrades()}>
              Calculate final grades
            </Button>
            <Button variant='outlined' onClick={downloadCsvTemplate}>
              Download CSV template
            </Button>
            <MenuButton label='Import grades' options={actionOptions} />
            <SisuExportDialog
              open={showSisuDialog}
              handleClose={handleCloseSisuDialog}
            />
            <FileLoadDialog
              instanceId={Number(instanceId)}
              open={showFileDialog}
              handleClose={handleCloseFileDialog}
              returnImportedGrades={updateGrades}
            />
          </Box>
        </Box>
      </Toolbar>
      <AlertSnackbar
        messageInfo={messageInfo} setMessageInfo={setMessageInfo}
        open={alertOpen} setOpen={setAlertOpen}
      />
    </>
  );
};

CourseResultsTableToolbar.propTypes = {
  search: PropTypes.string,
  setSearch: PropTypes.func,
  calculateFinalGrades: PropTypes.func,
  updateGrades: PropTypes.func
};

export default CourseResultsTableToolbar;
