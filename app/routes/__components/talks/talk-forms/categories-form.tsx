import { Checkbox, CheckboxHeadingGroup } from '~/design-system/forms/checkboxes.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/radio-group.tsx';

type FormProps = {
  categories: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  required?: boolean;
  initialValues?: string[];
};

type Props = { categoriesAllowMultiple: boolean } & FormProps;

export function CategoriesForm({ categoriesAllowMultiple, ...formProps }: Props) {
  if (categoriesAllowMultiple) {
    return <CategoriesCheckboxForm {...formProps} />;
  }
  return <CategoriesRadioForm {...formProps} />;
}

function CategoriesCheckboxForm({ categories, required, initialValues }: FormProps) {
  return (
    <CheckboxHeadingGroup label="Select proposal categories" description={required ? '(required)' : '(optional)'}>
      {categories.map((category) => (
        <Checkbox
          key={category.id}
          id={category.id}
          name="categories"
          value={category.id}
          defaultChecked={initialValues?.includes(category.id)}
          description={category.description}
        >
          {category.name}
        </Checkbox>
      ))}
    </CheckboxHeadingGroup>
  );
}

function CategoriesRadioForm({ categories, required, initialValues }: FormProps) {
  return (
    <RadioGroup label="Select proposal categories" description={required ? '(required)' : '(optional)'}>
      {categories.map((category) => (
        <Radio
          key={category.id}
          id={category.id}
          name="categories"
          value={category.id}
          defaultChecked={initialValues?.includes(category.id)}
          description={category.description}
        >
          {category.name}
        </Radio>
      ))}
    </RadioGroup>
  );
}
