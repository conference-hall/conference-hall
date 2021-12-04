import { Checkbox, CheckboxGroup } from '../ui/Checkboxes';

type FormatsFormProps = {
  formats: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  initialValues?: string[]
};

export function FormatsForm({ formats, initialValues }: FormatsFormProps) {
  return (
    <CheckboxGroup label="Select proposal formats">
      {formats.map((f: any) => (
        <Checkbox
          key={f.id}
          id={f.id}
          name="formats"
          value={f.id}
          defaultChecked={initialValues?.includes(f.id)}
          label={f.name}
          description={f.description}
        />
      ))}
    </CheckboxGroup>
  );
}
