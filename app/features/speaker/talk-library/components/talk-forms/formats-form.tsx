import { useTranslation } from 'react-i18next';
import { Checkbox, CheckboxGroup } from '~/design-system/forms/input-checkbox.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/input-radio.tsx';

type FormProps = {
  formats: Array<{ id: string; name: string; description?: string | null }>;
  required?: boolean;
  initialValues?: string[];
};

type Props = { formatsAllowMultiple: boolean } & FormProps;

export function FormatsForm({ formatsAllowMultiple, ...formProps }: Props) {
  if (formatsAllowMultiple) {
    return <FormatsCheckboxForm {...formProps} />;
  }
  return <FormatsRadioForm {...formProps} />;
}

function FormatsCheckboxForm({ formats, required, initialValues }: FormProps) {
  const { t } = useTranslation();
  return (
    <CheckboxGroup
      label={t('event.submission.tracks.select-formats')}
      description={required ? t('common.required') : t('common.optional')}
    >
      {formats.map((format) => (
        <Checkbox
          name="formats"
          key={format.id}
          value={format.id}
          defaultChecked={initialValues?.includes(format.id)}
          description={format.description}
        >
          {format.name}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}

function FormatsRadioForm({ formats, required, initialValues }: FormProps) {
  const { t } = useTranslation();
  return (
    <RadioGroup
      label={t('event.submission.tracks.select-formats')}
      description={required ? t('common.required') : t('common.optional')}
    >
      {formats.map((format) => (
        <Radio
          name="formats"
          key={format.id}
          value={format.id}
          defaultChecked={initialValues?.includes(format.id)}
          description={format.description}
        >
          {format.name}
        </Radio>
      ))}
    </RadioGroup>
  );
}
