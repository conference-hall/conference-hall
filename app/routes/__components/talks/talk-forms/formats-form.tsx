import { Checkbox, CheckboxHeadingGroup } from '~/design-system/forms/checkboxes.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/radio-group.tsx';

type FormProps = {
  formats: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
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
  return (
    <CheckboxHeadingGroup label="Select proposal formats" description={required ? '(required)' : '(optional)'}>
      {formats.map((format) => (
        <Checkbox
          key={format.id}
          id={format.id}
          name="formats"
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
  return (
    <RadioGroup label="Select proposal formats" description={required ? '(required)' : '(optional)'}>
      {formats.map((format) => (
        <Radio
          key={format.id}
          id={format.id}
          name="formats"
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
