import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Formik } from 'formik';
import { Calendar } from 'primereact/calendar';
import * as Yup from 'yup';
import EditSubjectFunction from '../../functions/EditSubject';
import { MultiSelect } from 'primereact/multiselect'; // Usando MultiSelect para escolher múltiplas opções
import { useEffect, useState } from 'react';

export default function EditSubjectComponent(props: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  subject: any;
}) {
  const [weekDays, setWeekDays] = useState<string[]>(
    props.subject?.weekDays?.split(',') || []
  );

  useEffect(() => {
    if (props.subject) {
      setWeekDays(
        props.subject.weekDays ? props.subject.weekDays.split(',') : []
      );
    }
  }, [props.subject]);

  const weekDaysOptions = [
    { label: 'Segunda', value: 'Segunda' },
    { label: 'Terça', value: 'Terça' },
    { label: 'Quarta', value: 'Quarta' },
    { label: 'Quinta', value: 'Quinta' },
    { label: 'Sexta', value: 'Sexta' },
  ];

  // Converte o array de dias em uma string separada por vírgulas
  const getWeekDaysString = () => weekDays.join(',');
  return (
    <Formik
      enableReinitialize
      initialValues={{
        codeSubject: props.subject?.codeSubject || '',
        nameSubject: props.subject?.nameSubject || '',
        professor: props.subject?.professor || '',
        weekDays: weekDays,
        startTime: new Date(props.subject.startTime * 1000),
        endTime: new Date(props.subject.endTime * 1000),
        local: props.subject?.local || '',
      }}
      onSubmit={(values) => {
        EditSubjectFunction(
          {
            ...values,
            weekDays: getWeekDaysString(),
          },
          props.subject.id
        ).then(() => {
          props.setVisible(false);
        });
      }}
      validationSchema={Yup.object().shape({
        codeSubject: Yup.string().required('O código da matéria é obrigatório'),
        nameSubject: Yup.string().required('O nome da matéria é obrigatório'),
        professor: Yup.string().required('O nome do professor é obrigatório'),
        weekDays: Yup.array().min(1, 'Os dias da semana são obrigatórios'),
        startTime: Yup.date().required('O horário é obrigatório'),
        endTime: Yup.date().required('O horário é obrigatório'),
        local: Yup.string().required('O local é obrigatório'),
      })}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        errors,
        touched,
      }) => (
        <form
          onSubmit={handleSubmit}
          className="card flex justify-content-center gap-6"
        >
          <Dialog
            header="Editar matéria"
            visible={props.visible}
            style={{ width: '30vw' }}
            onHide={() => props.setVisible(false)}
          >
            <FloatLabel>
              <InputText
                className="flex mt-5 mb-5 w-full"
                id="codeSubject"
                name="codeSubject"
                value={values.codeSubject}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label htmlFor="codeSubject">Código da matéria</label>
            </FloatLabel>
            {errors.codeSubject && touched.codeSubject ? (
              <div className="text-red-500">{errors.codeSubject}</div>
            ) : null}

            <FloatLabel>
              <InputText
                className="flex mt-5 mb-5 w-full"
                id="nameSubject"
                name="nameSubject"
                value={values.nameSubject}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label htmlFor="nameSubject">Nome da matéria</label>
            </FloatLabel>
            {errors.nameSubject && touched.nameSubject ? (
              <div className="text-red-500">{errors.nameSubject}</div>
            ) : null}

            <FloatLabel>
              <InputText
                className="flex mt-5 mb-5 w-full"
                id="professor"
                name="professor"
                value={values.professor}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label htmlFor="professor">Professor</label>
            </FloatLabel>
            {errors.professor && touched.professor ? (
              <div className="text-red-500">{errors.professor}</div>
            ) : null}

            <FloatLabel>
              <label htmlFor="weekDays">Dias da semana</label>
              <MultiSelect
                id="weekDays"
                name="weekDays"
                value={values.weekDays}
                options={weekDaysOptions}
                onChange={(e) => {
                  setFieldValue('weekDays', e.value);
                  setWeekDays(e.value);
                }}
                display="chip"
                className="flex mt-5 mb-5 w-full"
              />
              {errors.weekDays && touched.weekDays ? (
                <div className="text-red-500">{errors.weekDays}</div>
              ) : null}
            </FloatLabel>

            <div className="flex gap-3">
              <FloatLabel>
                <label htmlFor="buttondisplay" className="font-bold block mb-2">
                  Horário início
                </label>
                <Calendar
                  className="flex-1"
                  id="startTime"
                  name="startTime"
                  value={values.startTime}
                  onChange={(e) => setFieldValue('startTime', e.value)}
                  icon={() => <i className="pi pi-clock" />}
                  showIcon
                  timeOnly
                />
              </FloatLabel>
              {errors.startTime && touched.startTime ? (
                <div className="text-red-500">{errors.startTime}</div>
              ) : null}

              <FloatLabel>
                <label htmlFor="buttondisplay" className="font-bold block mb-2">
                  Horário fim
                </label>
                <Calendar
                  className="flex-1"
                  id="endTime"
                  name="endTime"
                  value={values.endTime}
                  onChange={(e) => setFieldValue('endTime', e.value)}
                  icon={() => <i className="pi pi-clock" />}
                  showIcon
                  timeOnly
                />
              </FloatLabel>
              {errors.endTime && touched.endTime ? (
                <div className="text-red-500">{errors.endTime}</div>
              ) : null}
            </div>

            <FloatLabel>
              <InputText
                className="flex mt-5 mb-5 w-full"
                id="local"
                name="local"
                value={values.local}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label htmlFor="local">Local</label>
            </FloatLabel>
            {errors.local && touched.local ? (
              <div className="text-red-500">{errors.local}</div>
            ) : null}

            <div className="flex justify-content-between flex-wrap">
              <Button
                outlined
                label="Fechar"
                style={{
                  borderColor: '#ff6060',
                  color: '#ff6060',
                }}
                onClick={() => props.setVisible(false)}
              />
              <Button onClick={handleSubmit} label="Confirmar" />
            </div>
          </Dialog>
        </form>
      )}
    </Formik>
  );
}
