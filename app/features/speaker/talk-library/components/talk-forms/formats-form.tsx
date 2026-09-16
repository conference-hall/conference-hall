import { useTranslation } from 'react-i18next';
import { FieldsetGroup } from '~/design-system/forms/fieldset-group.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { Radio } from '~/design-system/forms/input-radio.tsx';
import { formatDuration } from '~/shared/datetimes/datetimes.ts';

type Format = { id: string; name: string; description?: string | null; durationInMinutes?: number | null };

type FormProps = {
  formats: Array<Format>;
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
  const { t, i18n } = useTranslation();
  return (
    <FieldsetGroup
      legend={t('event.submission.tracks.select-formats')}
      hint={required ? t('common.required') : t('common.optional')}
    >
      {formats.map((format) => (
        <Checkbox
          name="formats"
          key={format.id}
          value={format.id}
          defaultChecked={initialValues?.includes(format.id)}
          description={format.description}
        >
          {formatLabel(format, i18n.language)}
        </Checkbox>
      ))}
    </FieldsetGroup>
  );
}

function FormatsRadioForm({ formats, required, initialValues }: FormProps) {
  const { t, i18n } = useTranslation();
  return (
    <FieldsetGroup
      legend={t('event.submission.tracks.select-formats')}
      hint={required ? t('common.required') : t('common.optional')}
    >
      {formats.map((format) => (
        <Radio
          name="formats"
          key={format.id}
          value={format.id}
          defaultChecked={initialValues?.includes(format.id)}
          description={format.description}
        >
          {formatLabel(format, i18n.language)}
        </Radio>
      ))}
    </FieldsetGroup>
  );
}

function formatLabel(format: Format, locale: string) {
  if (!format.durationInMinutes) return format.name;
  return `${format.name} (${formatDuration(format.durationInMinutes, locale)})`;
}
