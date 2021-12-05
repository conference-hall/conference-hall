import { Checkbox, CheckboxGroup } from '../../../components/forms/Checkboxes';

type CategoriesFormProps = {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  initialValues?: string[]
};

export function CategoriesForm({ categories, initialValues }: CategoriesFormProps) {
  return (
    <CheckboxGroup label="Select proposal categories">
      {categories.map((c: any) => (
        <Checkbox
          key={c.id}
          id={c.id}
          name="categories"
          value={c.id}
          defaultChecked={initialValues?.includes(c.id)}
          label={c.name}
          description={c.description}
        />
      ))}
    </CheckboxGroup>
  );
}
