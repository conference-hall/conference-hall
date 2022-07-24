import {
  Checkbox,
  CheckboxHeadingGroup,
} from '~/components-ui/forms/Checkboxes';

type Props = {
  formats: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  initialValues?: string[];
};

export function FormatsForm({ formats, initialValues }: Props) {
  return (
    <CheckboxHeadingGroup
      label="Select proposal formats"
      description="Select one or severals formats proposed by the event organizers."
    >
      {formats.map((f: any) => (
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
