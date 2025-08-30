import { useTranslation } from 'react-i18next';
import { FieldsetGroup } from '~/design-system/forms/fieldset-group.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { Radio } from '~/design-system/forms/input-radio.tsx';

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
    <FieldsetGroup
      label={t('event.submission.tracks.select-categories')}
      hint={required ? t('common.required') : t('common.optional')}
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
    </FieldsetGroup>
  );
}

function CategoriesRadioForm({ categories, required, initialValues }: FormProps) {
  const { t } = useTranslation();
  return (
    <FieldsetGroup
      label={t('event.submission.tracks.select-categories')}
      hint={required ? t('common.required') : t('common.optional')}
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
    </FieldsetGroup>
  );
}
