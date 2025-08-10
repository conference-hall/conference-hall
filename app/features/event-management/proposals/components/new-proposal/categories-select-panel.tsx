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
import type { SubmissionError } from '~/shared/types/errors.types.ts';

type Props = {
  team: string;
  event: string;
  form?: string;
  defaultValue?: Array<SelectPanelOption>;
  error?: SubmissionError;
  options: Array<SelectPanelOption>;
  onChange?: (options: Array<SelectPanelOption>) => void;
  multiple?: boolean;
  className?: string;
};

export function CategoriesSelectPanel({
  team,
  event,
  form,
  defaultValue = [],
  error,
  options,
  onChange,
  multiple = true,
  className,
}: Props) {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<Array<SelectPanelOption>>(defaultValue);

  const handleChange = (selectedOptions: Array<{ value: string; label: string }>) => {
    setSelectedCategories(selectedOptions);
    onChange?.(selectedOptions);
  };

  return (
    <div className={className}>
      <SelectPanel
        name="categories"
        form={form}
        label={t('common.categories')}
        defaultValue={selectedCategories.map((category) => category.value)}
        options={options}
        onChange={handleChange}
        multiple={multiple}
        footer={<Action team={team} event={event} />}
      >
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.categories')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <div className="flex flex-wrap gap-2">
        {selectedCategories.length === 0 && !error ? <Text size="xs">{t('common.no-categories')}</Text> : null}

        {selectedCategories.length === 0 && error ? (
          <Text size="s" variant="error">
            {error[0]}
          </Text>
        ) : null}

        {selectedCategories.map((category) => (
          <Badge key={category.value}>{category.label}</Badge>
        ))}
      </div>
    </div>
  );
}

function Action({ team, event }: { team: string; event: string }) {
  const { t } = useTranslation();
  const to = href('/team/:team/:event/settings/tracks', { team, event });
  return (
    <Link to={to} className={cx('hover:bg-gray-100', menuItem())}>
      <PencilSquareMicroIcon className="text-gray-400" />
      {t('common.categories-select-panel.manage')}
    </Link>
  );
}
