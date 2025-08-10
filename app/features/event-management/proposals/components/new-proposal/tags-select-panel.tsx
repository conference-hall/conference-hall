import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import { SelectPanel, type SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { PencilSquareMicroIcon } from '~/design-system/icons/pencil-square-micro-icon.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { Tag } from '~/design-system/tag.tsx';
import { H2, Text } from '~/design-system/typography.tsx';

type Props = {
  team: string;
  event: string;
  form?: string;
  defaultValue?: Array<SelectPanelOption>;
  options: Array<SelectPanelOption>;
  onChange?: (options: Array<SelectPanelOption>) => void;
  className?: string;
};

export function TagsSelectPanel({ team, event, form, defaultValue = [], options, onChange, className }: Props) {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<Array<SelectPanelOption>>(defaultValue);

  const handleChange = (selectedOptions: Array<SelectPanelOption>) => {
    setSelectedTags(selectedOptions);
    onChange?.(selectedOptions);
  };

  return (
    <div className={className}>
      <SelectPanel
        name="tags"
        form={form}
        label={t('common.tags-list.label')}
        defaultValue={selectedTags.map((tag) => tag.value)}
        options={options}
        onChange={handleChange}
        footer={<Action team={team} event={event} />}
      >
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.tags')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <div className="flex flex-wrap gap-2">
        {selectedTags.length === 0 ? <Text size="xs">{t('common.no-tags')}</Text> : null}

        {selectedTags.map((tag) => (
          <Tag key={tag.value} tag={{ id: tag.value, name: tag.label, color: tag.color || '' }} />
        ))}
      </div>
    </div>
  );
}

function Action({ team, event }: { team: string; event: string }) {
  const { t } = useTranslation();
  const to = href('/team/:team/:event/settings/tags', { team, event });
  return (
    <Link to={to} className={cx('hover:bg-gray-100', menuItem())}>
      <PencilSquareMicroIcon className="text-gray-400" />
      {t('common.tags-select-panel.manage')}
    </Link>
  );
}
