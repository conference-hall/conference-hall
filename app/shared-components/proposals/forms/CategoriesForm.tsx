import { Checkbox, CheckboxHeadingGroup } from '../../../design-system/forms/Checkboxes';

type Props = {
  categories: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  initialValues?: string[];
};

export function CategoriesForm({ categories, initialValues }: Props) {
  return (
    <CheckboxHeadingGroup label="Select proposal categories">
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
