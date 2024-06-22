import { Checkbox, CheckboxHeadingGroup } from '~/design-system/forms/checkboxes.tsx';

type Props = {
  formats: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  required?: boolean;
  initialValues?: string[];
};

export function FormatsForm({ formats, required, initialValues }: Props) {
  return (
    <CheckboxHeadingGroup label="Select proposal formats" description={required ? '(required)' : '(optional)'}>
      {formats.map((f) => (
        <Checkbox
          key={f.id}
          id={f.id}
          name="formats"
          value={f.id}
          defaultChecked={initialValues?.includes(f.id)}
          description={f.description}
        >
          {f.name}
        </Checkbox>
      ))}
    </CheckboxHeadingGroup>
  );
}
