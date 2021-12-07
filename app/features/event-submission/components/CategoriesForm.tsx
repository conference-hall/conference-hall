import { Checkbox, CheckboxGroup } from '../../../components/forms/Checkboxes';

type CategoriesFormProps = {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  initialValues?: string[];
};

export function CategoriesForm({ categories, initialValues }: CategoriesFormProps) {
  return (
    <CheckboxGroup
      label="Select proposal categories"
      description="Select categories that are the best fit for your proposal."
    >
      {categories.map((c: any) => (
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
    </CheckboxGroup>
  );
}
