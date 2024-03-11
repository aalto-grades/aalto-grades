import {
  AttainmentGradesData,
  StudentGradesTree,
  StudentRow,
  UserData,
} from '@common/types';
import {MoreVert} from '@mui/icons-material';
import {IconButton, Tooltip, Typography} from '@mui/material';
import {
  DataGrid,
  GRID_STRING_COL_DEF,
  GridColDef,
  GridColTypeDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useGetAttainments} from '../../hooks/useApi';
import GradeOptionsDialog from './GradeOptionsDialog';
import StudentGradesDialog from './StudentGradesDialog';

type RowData = {
  student: UserData;
  attainment?: AttainmentGradesData;
};

const CourseResultsMuiTable = ({data}: {data: StudentGradesTree[]}) => {
  const {courseId} = useParams() as {courseId: string};
  const attainments = useGetAttainments(courseId);
  const [gradeOptionsOpen, setGradeOptionsOpen] = useState<boolean>(false);
  const [studentGradesOpen, setStudentGradesOpen] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null);

  const typedData = data as unknown as StudentRow[];
  if (attainments.data === undefined) return <></>;
  const rowMap: {[key: number]: StudentRow} = {};
  for (const row of typedData) rowMap[row.user.id as number] = row;

  // Custom attainment cell
  const GradeCell = (props: GridRenderCellParams) => {
    if (props.value === null || props.value === undefined) return null;

    const rowData = rowMap[props.row.id];
    const attainment = rowData.attainments.find(
      att => att.attainmentName === props.field
    ) as AttainmentGradesData;
    return (
      <>
        <Typography>{props.value}</Typography>
        {(props.hasFocus || attainment.grades.length > 1) && (
          <Tooltip
            placement="top"
            title={
              attainment.grades.length === 1
                ? 'Edit grades'
                : 'Multiple grades, click to show'
            }
          >
            <IconButton
              size="small"
              onClick={() => {
                setGradeOptionsOpen(true);
                setSelectedRowData({student: rowData.user, attainment});
              }}
            >
              <MoreVert color="primary" fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  };
  const gradeColumnType: GridColTypeDef<number> = {
    ...GRID_STRING_COL_DEF,
    resizable: false,
    editable: false,
    groupable: false,
    renderCell: params => <GradeCell {...params} />,
  };

  // Data grid definition
  const columns: GridColDef[] = [
    {
      field: 'StudentNo',
      headerName: 'Student Number',
      type: 'string',
      width: 120,
      //   editable: true,
    },
    {
      field: 'Final Grade',
      headerName: 'Final Grade',
      type: 'number',
      //   editable: true,
    },
    {
      field: 'Exported',
      headerName: 'Exported To Sisu',
      type: 'boolean',
      width: 125,
      //   editable: true,
    },
    ...attainments.data.map(att => ({
      ...gradeColumnType,
      field: att.name,
      headerName: att.name,
      //   editable: true,
    })),
  ];

  const rows: GridRowsProp = typedData.map(row => {
    const studentData: {
      [key: string]: number | string | boolean;
    } = {
      id: row.user.id as number,
      StudentNo: row.user.studentNumber as string,
      Exported: false,
    };
    for (const att of row.attainments) {
      studentData[att.attainmentName as string] = att.grades[0].grade;
    }
    return studentData;
  });

  return (
    <>
      <GradeOptionsDialog
        title={`Grades of ${
          selectedRowData?.student.studentNumber as string
        } for ${selectedRowData?.attainment?.attainmentName}`}
        options={selectedRowData?.attainment?.grades ?? []}
        open={gradeOptionsOpen && selectedRowData !== null}
        handleClose={(): void => setGradeOptionsOpen(false)}
      />
      <StudentGradesDialog
        user={selectedRowData?.student ?? null}
        open={studentGradesOpen && selectedRowData !== null}
        setOpen={setStudentGradesOpen}
      />

      <DataGrid
        columns={columns}
        rows={rows}
        disableRowSelectionOnClick
        checkboxSelection
        rowHeight={25}
        sx={{maxHeight: '70vh', minHeight: '150px'}}
      />
    </>
  );
};

export default CourseResultsMuiTable;
