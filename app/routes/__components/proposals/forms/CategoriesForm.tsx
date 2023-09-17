import { Checkbox, CheckboxHeadingGroup } from '~/design-system/forms/Checkboxes.tsx';

type Props = {
  categories: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  required?: boolean;
  initialValues?: string[];
};

export function CategoriesForm({ categories, required, initialValues }: Props) {
  return (
    <CheckboxHeadingGroup label="Select proposal categories" description={required ? '(required)' : '(optional)'}>
      {categories.map((c) => (
        <Checkbox
          key={c.id}
          id={c.id}
          name="categories"
          value={c.id}
          defaultChecked={initialValues?.includes(c.id)}
          description={c.description}
        >
          {c.name}
        </Checkbox>
      ))}
    </CheckboxHeadingGroup>
  );
}
