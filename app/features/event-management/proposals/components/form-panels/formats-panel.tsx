import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
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

export function FormatsPanel({
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
  const [formats, setFormats] = useState<Array<SelectPanelOption>>(defaultValue);
  const selectedFormats = value ?? formats;

  const handleChange = (selectedOptions: Array<{ value: string; label: string }>) => {
    if (!value) setFormats(selectedOptions);
    onChange?.(selectedOptions);
  };

  if (readonly) {
    return (
      <div className={className}>
        <H2 size="s">{t('common.formats')}</H2>
        <FormatsList formats={selectedFormats} />
      </div>
    );
  }

  return (
    <div className={className}>
      <SelectPanel
        name="formats"
        form={form}
        label={t('common.formats')}
        values={selectedFormats.map((format) => format.value)}
        options={options}
        onChange={handleChange}
        multiple={multiple}
        footer={showAction ? <Action team={team} event={event} /> : null}
      >
        <div className="group flex items-center justify-between">
          <H2 size="s" className="group-hover:text-indigo-600">
            {t('common.formats')}
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" aria-hidden />
        </div>
      </SelectPanel>

      <FormatsList formats={selectedFormats} error={error} />
    </div>
  );
}

function FormatsList({ formats, error }: { formats: Array<SelectPanelOption>; error?: SubmissionError }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {formats.length === 0 && !error ? <Text size="xs">{t('common.no-formats')}</Text> : null}

      {error ? (
        <Text size="s" variant="error">
          {error[0]}
        </Text>
      ) : null}

      {formats.map((format) => (
        <Badge key={format.value}>{format.label}</Badge>
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
      {t('common.formats-select-panel.manage')}
    </Link>
  );
}
