import { useTranslation } from 'react-i18next';
import { Checkbox, CheckboxHeadingGroup } from '~/shared/design-system/forms/checkboxes.tsx';
import { Radio, RadioGroup } from '~/shared/design-system/forms/radio-group.tsx';

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
    <CheckboxHeadingGroup
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
    </CheckboxHeadingGroup>
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
