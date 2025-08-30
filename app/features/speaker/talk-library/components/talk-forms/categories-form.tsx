import { useTranslation } from 'react-i18next';
import { Checkbox, CheckboxGroup } from '~/design-system/forms/input-checkbox.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/input-radio.tsx';

type FormProps = {
  categories: Array<{ id: string; name: string; description?: string | null }>;
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
  const { t } = useTranslation();
  return (
    <CheckboxGroup
      label={t('event.submission.tracks.select-categories')}
      description={required ? t('common.required') : t('common.optional')}
    >
      {categories.map((category) => (
        <Checkbox
          name="categories"
          key={category.id}
          value={category.id}
          defaultChecked={initialValues?.includes(category.id)}
          description={category.description}
        >
          {category.name}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}

function CategoriesRadioForm({ categories, required, initialValues }: FormProps) {
  const { t } = useTranslation();
  return (
    <RadioGroup
      label={t('event.submission.tracks.select-categories')}
      description={required ? t('common.required') : t('common.optional')}
    >
      {categories.map((category) => (
        <Radio
          name="categories"
          key={category.id}
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
