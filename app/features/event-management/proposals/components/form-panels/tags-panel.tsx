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
  value?: Array<SelectPanelOption>;
  options: Array<SelectPanelOption>;
  onChange?: (options: Array<SelectPanelOption>) => void;
  className?: string;
  readonly?: boolean;
  showAction?: boolean;
};

export function TagsPanel({
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
}: Props) {
  const { t } = useTranslation();

  // Use controlled value if provided, otherwise use internal state
  const [tags, setTags] = useState<Array<SelectPanelOption>>(defaultValue);
  const selectedTags = value ?? tags;

  const handleChange = (selectedOptions: Array<SelectPanelOption>) => {
    if (!value) setTags(selectedOptions);
    onChange?.(selectedOptions);
  };

  if (readonly) {
    return (
      <div className={className}>
        <H2 size="s">{t('common.tags')}</H2>
        <TagsList tags={selectedTags} />
      </div>
    );
  }

  return (
    <div className={className}>
      <SelectPanel
        name="tags"
        form={form}
        label={t('common.tags-list.label')}
        defaultValue={selectedTags.map((tag) => tag.value)}
        options={options}
        onChange={handleChange}
        footer={showAction ? <Action team={team} event={event} /> : null}
      >
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.tags')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <TagsList tags={selectedTags} />
    </div>
  );
}

function TagsList({ tags }: { tags: Array<SelectPanelOption> }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {tags.length === 0 ? <Text size="xs">{t('common.no-tags')}</Text> : null}
      {tags.map((tag) => (
        <Tag key={tag.value} tag={{ id: tag.value, name: tag.label, color: tag.color || '' }} />
      ))}
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
