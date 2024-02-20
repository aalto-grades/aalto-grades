import {Box, Button, Dialog, TextField} from '@mui/material';
import {Form, Formik} from 'formik';
import {FC, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useAddAttainment} from '../../hooks/useApi';

type Props = {
  handleClose: () => void;
  open: boolean;
};

const AddAttainmentDialog: FC<Props> = props => {
  const addAttainment = useAddAttainment();
  const [attainment, setAttainment] = useState({name: '', daysValid: 365});
  const {courseId} = useParams() as {courseId: string};

  const handleSave = () => {
    addAttainment.mutate({courseId: courseId, attainment: attainment});
    props.handleClose();
  };
  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Formik
          initialValues={attainment}
          onSubmit={values => {
            setAttainment(values);
            handleSave();
          }}
        >
          <Form>
            <TextField
              name="name"
              label="Name"
              onChange={e =>
                setAttainment({...attainment, name: e.target.value})
              }
            />

            <TextField
              name="daysValid"
              label="Days valid"
              type="number"
              onChange={e =>
                setAttainment({
                  ...attainment,
                  daysValid: Number(e.target.value),
                })
              }
            />

            <Button type="submit">Save</Button>
            <Button onClick={props.handleClose}>Cancel</Button>
          </Form>
        </Formik>
      </Box>
    </Dialog>
  );
};

export default AddAttainmentDialog;
