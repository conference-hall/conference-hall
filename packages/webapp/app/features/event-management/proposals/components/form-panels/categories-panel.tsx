import type { SubmissionError } from '@conference-hall/shared/types/errors.types.ts';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import { Badge } from '~/design-system/badges.tsx';
import { SelectPanel, type SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { PencilSquareMicroIcon } from '~/design-system/icons/pencil-square-micro-icon.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { H2, Text } from '~/design-system/typography.tsx';

type Props = {
  team: string;
  event: string;
  form?: string;
  defaultValue?: Array<SelectPanelOption>;
  value?: Array<SelectPanelOption>;
  options: Array<SelectPanelOption>;
  onChange?: (options: Array<SelectPanelOption>) => void;
  className?: string;
  readonly?: boolean;
  showAction?: boolean;
  multiple?: boolean;
  error?: SubmissionError;
};

export function CategoriesPanel({
  team,
  event,
  form,
  defaultValue = [],
  value,
  options,
  onChange,
  className,
  readonly = false,
  showAction = true,
  multiple = true,
  error,
}: Props) {
  const { t } = useTranslation();

  // Use controlled value if provided, otherwise use internal state
  const [categories, setCategories] = useState<Array<SelectPanelOption>>(defaultValue);
  const selectedCategories = value ?? categories;

  const handleChange = (selectedOptions: Array<{ value: string; label: string }>) => {
    if (!value) setCategories(selectedOptions);
    onChange?.(selectedOptions);
  };

  if (readonly) {
    return (
      <div className={className}>
        <H2 size="s">{t('common.categories')}</H2>
        <CategoriesList categories={selectedCategories} />
      </div>
    );
  }

  return (
    <div className={className}>
      <SelectPanel
        name="categories"
        form={form}
        label={t('common.categories')}
        values={selectedCategories.map((category) => category.value)}
        options={options}
        onChange={handleChange}
        multiple={multiple}
        footer={showAction ? <Action team={team} event={event} /> : null}
      >
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.categories')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <CategoriesList categories={selectedCategories} error={error} />
    </div>
  );
}

function CategoriesList({ categories, error }: { categories: Array<SelectPanelOption>; error?: SubmissionError }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {categories.length === 0 && !error ? <Text size="xs">{t('common.no-categories')}</Text> : null}

      {error ? (
        <Text size="s" variant="error">
          {error[0]}
        </Text>
      ) : null}

      {categories.map((category) => (
        <Badge key={category.value}>{category.label}</Badge>
      ))}
    </div>
  );
}

function Action({ team, event }: { team: string; event: string }) {
  const { t } = useTranslation();
  const to = href('/team/:team/:event/settings/tracks', { team, event });
  return (
    <Link to={to} className={cx('hover:bg-gray-100 focus:outline-indigo-600', menuItem())}>
      <PencilSquareMicroIcon className="text-gray-400" />
      {t('common.categories-select-panel.manage')}
    </Link>
  );
}
