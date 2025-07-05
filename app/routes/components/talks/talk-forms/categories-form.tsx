import { useTranslation } from 'react-i18next';
import { Checkbox, CheckboxHeadingGroup } from '~/shared/design-system/forms/checkboxes.tsx';
import { Radio, RadioGroup } from '~/shared/design-system/forms/radio-group.tsx';

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
    <CheckboxHeadingGroup
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
    </CheckboxHeadingGroup>
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
