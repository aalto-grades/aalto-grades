import {ListItem, ListItemButton, ListItemText} from '@mui/material';
import {grey} from '@mui/material/colors';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {CoursePartData} from '@/common/types';

type PropsType = {
  part: CoursePartData;
  onCreate: () => void;
  // model: GradingModelData;
  // editRights: boolean;
  // modelsWithFinalGrades: Set<number>;
  // onEdit: () => void;
  // onArchive: () => void;
  // onDelete: () => void;
  // onClick: () => void;
};
const MissingModelButton = ({
  part,
  onCreate,
  // model,
  // editRights,
  // modelsWithFinalGrades,
  // onEdit,
  // onArchive,
  // onDelete,
  // onClick,
}: PropsType): JSX.Element => {
  const {t: _} = useTranslation();

  // let warning = '';
  // if (model.hasArchivedCourseParts && model.hasDeletedCourseParts)
  //   warning = t('course.models.has-deleted-and-archived');
  // else if (model.hasArchivedCourseParts)
  //   warning = t('course.models.has-archived');
  // else if (model.hasDeletedCourseParts)
  //   warning = t('course.models.has-deleted');

  return (
    <ListItem
      sx={{backgroundColor: grey[300]}}
      disablePadding
      // secondaryAction={
      //   editRights ? (
      //     <>
      //       <Tooltip placement="top" title={t('course.models.rename.title')}>
      //         <IconButton onClick={onEdit}>
      //           <Edit />
      //         </IconButton>
      //       </Tooltip>
      //       <Tooltip
      //         placement="top"
      //         title={
      //           model.archived
      //             ? t('course.models.unarchive')
      //             : t('course.models.archive')
      //         }
      //       >
      //         <IconButton onClick={onArchive}>
      //           {model.archived ? <Unarchive /> : <Archive />}
      //         </IconButton>
      //       </Tooltip>
      //       <Tooltip
      //         placement="top"
      //         title={
      //           modelsWithFinalGrades.has(model.id)
      //             ? t('course.models.cannot-delete-with-final')
      //             : t('course.models.delete-grading-model')
      //         }
      //       >
      //         {/* The span is necessary because tooltips don't like disabled buttons*/}
      //         <span>
      //           <IconButton
      //             disabled={modelsWithFinalGrades.has(model.id)}
      //             edge="end"
      //             onClick={onDelete}
      //           >
      //             <Delete />
      //           </IconButton>
      //         </span>
      //       </Tooltip>
      //     </>
      //   ) : null
      // }
    >
      <ListItemButton onClick={onCreate}>
        <ListItemText primary={part.name} />
        {/* {(model.hasArchivedCourseParts || model.hasDeletedCourseParts) && (
          <ListItemIcon sx={{mr: 6.6}}>
            <Tooltip title={warning} placement="top">
              <Warning color="warning" />
            </Tooltip>
          </ListItemIcon>
        )} */}
      </ListItemButton>
    </ListItem>
  );
};

export default MissingModelButton;
